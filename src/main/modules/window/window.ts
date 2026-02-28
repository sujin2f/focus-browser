import { nativeTheme, type BaseWindowConstructorOptions } from 'electron'
/* CONSTANTS */
import { BROWSER } from '@src/common/constants'
/* Models */
import { History } from '@main/store/history'
import { Status } from '@main/store/status'
import { BrowserView } from '@main/modules/view/browser'
import { CenterView } from '@main/modules/view/centre'
import { Logger } from '@main/lib/logger'
import { AbsWindowIPC } from '@main/modules/window/abs-window-ipc'
/* T_Types */
import type { T_IPC_Switch } from '@src/common/types'

enum VIEWS {
    BROWSER,
    CENTRE,
}
/**
 * All starts with here
 */
export class BrowserWindow extends AbsWindowIPC {
    // mode
    private _view!: VIEWS
    private get view(): BrowserView | CenterView {
        return this._view === VIEWS.CENTRE ? this.centre : this.browser
    }
    private set view(view: VIEWS) {
        // 😃 Nothing changed
        if (this._view === view) return

        this._view = view
        switch (view) {
            case VIEWS.CENTRE:
                this.contentView = this.centre
                this.browser.hide()
                this.centre.show()
                return
            case VIEWS.BROWSER:
                this.centre.hide()
                this.browser.show()
                this.contentView = this.browser
                return
        }
    }

    constructor(options?: BaseWindowConstructorOptions) {
        Logger.getInstance().log('BrowserWindow::constructor()')
        super(options)

        this.browser = new BrowserView()
        this.centre = new CenterView()
        this.view = VIEWS.CENTRE

        const status = Status.getInstance()
        const bounds = status.getBounds(this.getBounds())
        this.setBounds(bounds)

        // Events
        this.addListener('close', () => this.saveStatus()).addListener(
            'resize',
            () => {
                const bounds = this.getContentBounds()
                this.browser.setBounds({
                    x: 0,
                    y: 0,
                    width: bounds.width,
                    height: bounds.height,
                })
            },
        )

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

        if (request.scene !== BROWSER) {
            this.view = VIEWS.CENTRE
            this.centre.scene = request.scene
            return
        }

        Logger.getInstance().log(
            'Switched to Browser: ',
            this.browser.url,
            request,
        )

        this.view = VIEWS.BROWSER

        if (request.searchEngine || !this.browser.url) {
            this.browser.searchKeyword('')
        } else if (request.address) {
            this.browser.loadURL(request.address)
        } else if (request.reloading || this.browser.failedUrl) {
            this.browser.reload()
        } else if (!request.address) {
            this.browser.backToBrowser()
        }
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
        this.view.webContents.stop()
    }

    toggleMaximize() {
        if (this.isMaximized()) {
            this.unmaximize()
            return
        }
        this.maximize()
    }
}
