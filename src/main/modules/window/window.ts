import {
    nativeTheme,
    View,
    Notification,
    type BaseWindowConstructorOptions,
} from 'electron'
/* CONSTANTS */
import {
    BROWSER,
    CENTRE_PAGES,
    FIND,
    IPC_CHANNELS,
    REQUEST_HANDLER,
} from '@src/common/constants'
/* Models */
import { History } from '@main/store/history'
import { Status } from '@main/store/status'
import { BrowserView } from '@main/modules/view/browser'
import { CenterView } from '@main/modules/view/centre'
import { Logger } from '@src/common/logger'
import { AbsWindowIPC } from '@main/modules/window/abs-window-ipc'
import { FindView } from '@main/modules/view/find'
/* T_Types */
import type { T_IPC_Switch } from '@src/common/types'
import type { T_Bookmark } from '@src/common/types/store'

const VIEWS = {
    BROWSER: BROWSER,
    FIND: FIND,
    CENTRE: 'centre',
}
type VIEWS = (typeof VIEWS)[keyof typeof VIEWS]
/**
 * All starts with here
 */
export class BrowserWindow extends AbsWindowIPC {
    // 🔍 Find
    private parentView?: View
    protected find: FindView

    // 👁️ Views
    private _view!: VIEWS
    private get view(): BrowserView | CenterView {
        return this._view === VIEWS.CENTRE ? this.centre : this.browser
    }
    private set view(view: VIEWS) {
        // 😃 Nothing changed
        if (this._view === view) return

        this._view = view
        this.parentView = undefined
        this.find.setVisible(false)

        switch (view) {
            case VIEWS.CENTRE:
                this.contentView = this.centre
                this.browser.hide()
                this.centre.show()
                return
            case VIEWS.BROWSER:
                this.contentView = this.browser
                this.centre.hide()
                this.browser.show()
                return
            case VIEWS.FIND: {
                this.centre.hide()
                this.browser.show()

                this.parentView = new View()
                this.contentView = this.parentView
                this.contentView.addChildView(this.browser)
                this.contentView.addChildView(this.find)
                this.find.setVisible(true)

                const bounds = this.getContentBounds()
                this.find.resize(bounds)
                this.find.webContents.focus()

                return
            }
        }
    }

    constructor(options?: BaseWindowConstructorOptions) {
        Logger.getInstance().log('BrowserWindow::constructor()')
        super(options)
        const status = Status.getInstance()
        const bounds = status.getBounds(this.getBounds())

        this.browser = new BrowserView()
        this.centre = new CenterView()
        this.find = new FindView()

        this.view = VIEWS.CENTRE
        this.find.setBounds(bounds)
        this.find.setVisible(false)

        this.setBounds(bounds)

        // Events
        this.addListener('close', () => this.saveStatus()).addListener(
            'resize',
            () => {
                // 😃 Find mode only
                if (this._view === VIEWS.FIND) return

                const bounds = this.getContentBounds()
                this.browser.resize(bounds)
                this.find.resize(bounds)
            },
        )

        this.browser.webContents
            .on('found-in-page', (_, result) => {
                Logger.getInstance().log('found-in-page result', result)
                this.find.setMatched(result.matches, result.activeMatchOrdinal)
            })
            .on('dom-ready', () => {
                this.centre.send(
                    IPC_CHANNELS.FAVICON,
                    REQUEST_HANDLER.REQUEST,
                    [this.browser.url, ''],
                )
            })

        if (nativeTheme.shouldUseDarkColors) {
            this.browser.setBackgroundColor('#030712')
            this.centre.setBackgroundColor('#030712')
        }
    }

    /**
     * Switch Scene
     */
    public switch(request: T_IPC_Switch) {
        Logger.getInstance().log('Switch: ', request)

        // 🤬 Find cannot set in Centre mode
        if (this._view === VIEWS.CENTRE && request.scene === FIND) return

        if (request.scene !== BROWSER && request.scene !== FIND) {
            this.view = VIEWS.CENTRE
            this.centre.scene = request.scene
            return
        }

        Logger.getInstance().log(
            'Switched to Browser: ',
            this.browser.url,
            request,
        )

        if (request.searchEngine || !this.browser.url) {
            this.browser.searchKeyword('')
        } else if (request.address) {
            this.browser.loadURL(request.address)
        } else if (request.reloading || this.browser.failedUrl) {
            this.browser.reload()
        } else if (!request.address) {
            this.browser.backToBrowser()
        }

        this.view = request.scene
    }

    /**
     * Save current status when the app is closed
     */
    private saveStatus() {
        const status = Status.getInstance()
        const bounds = this.getBounds()
        status.set('width', bounds.width)
        status.set('height', bounds.height)
        status.set('x', bounds.x)
        status.set('y', bounds.y)
        status.save()

        // Save history
        if (this.browser && this.browser.webContents) {
            Logger.getInstance().log('Save history')

            const entries = this.browser.webContents.navigationHistory
            const maxHistory = status.get('maxHistory')

            Logger.getInstance().log('entries.length', entries.length())
            Logger.getInstance().log('maxHistory', maxHistory)

            new History().save(entries, maxHistory)
        }
    }

    reload() {
        this.browser.reload()
        this.find.webContents.reload()
    }

    show() {
        super.show()
        this.view.webContents.focus()
    }

    toggleDevTools() {
        this.view.webContents.toggleDevTools()
    }

    goBack() {
        this.view.webContents.navigationHistory.goBack()
    }

    goForward() {
        this.view.webContents.navigationHistory.goForward()
    }

    stop() {
        switch (this._view) {
            case VIEWS.BROWSER:
                this.view.webContents.stop()
                return
            case VIEWS.CENTRE:
                return
            case VIEWS.FIND:
                this.stopFindInPage()
                return
        }
    }

    toggleMaximize() {
        if (this.isMaximized()) {
            this.unmaximize()
            return
        }
        this.maximize()
    }

    focusFindInPage(text: string, forward: boolean) {
        Logger.getInstance().log(`focusFindInPage('${text}', ${forward})`)
        this.find.focus()
        this.findInPage(text, forward)
    }

    findInPage(text: string, forward: boolean, reset?: boolean) {
        Logger.getInstance().log(`findInPage('${text}', ${forward})`)
        if (this._view !== VIEWS.FIND) {
            this.find.focus()
        }

        this.view = VIEWS.FIND

        if (reset) {
            this.find.keyword = ''
            this.browser.webContents.stopFindInPage('clearSelection')
            return
        }

        if (text) {
            this.find.keyword = text
            this.browser.webContents.findInPage(this.find.keyword, {
                forward,
                findNext: true,
            })
            return
        }

        if (this.find.keyword) {
            this.browser.webContents.findInPage(this.find.keyword, {
                forward,
                findNext: true,
            })
            return
        }
    }

    stopFindInPage() {
        // 🤬 Only from Find mode
        if (this._view !== VIEWS.FIND) return

        this.browser.webContents.stopFindInPage('clearSelection')
        this.find.keyword = ''
        this.find.reset()
        this.view = VIEWS.BROWSER
    }

    /**
     * 🔖 Persist a bookmark using the Bookmarks store and show a Notification
     * only when the push succeeds. Notification click switches to bookmark page.
     */
    public addBookmark() {
        // 🤬 Not Active
        if (this._view === VIEWS.CENTRE) return

        this.centre.send(IPC_CHANNELS.BOOKMARK, REQUEST_HANDLER.ADD, {
            id: '',
            title: this.browser.webContents.getTitle(),
            url: this.browser.webContents.getURL(),
            type: 'bookmark',
        } satisfies T_Bookmark)

        const notification = new Notification({
            title: 'Focus',
            body: 'New Bookmark Added',
            silent: true,
        })
        // Clicking the notification navigates to the bookmark page
        notification.addListener('click', () => {
            this.switch({ scene: CENTRE_PAGES.BOOKMARK })
        })
        notification.show()
        Logger.getInstance().log('addBookmark >> notification should be shown.')
    }
}
