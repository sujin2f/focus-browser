import {
    Menu,
    session,
    WebContentsView,
    webFrame,
    type BaseWindowConstructorOptions,
} from 'electron'

import { preload, resolveHtmlPath } from '@main/util'
import { Channel, SceneBrowser, PageType, type Scenes } from '@src/types'

import History from '@main/modules/store/history'
import Status from '@main/modules/store/status'
import Bookmarks from '@main/modules/store/bookmarks'
import PopupBlocker from '@main/modules/store/popup'
import Anchors from '@main/modules/store/anchors'

import { BrowserView } from '@src/main/modules/view/browser'
import { Logger } from '@main/modules/logger'
import { AbsWindowIPC } from './abs-window-ipc'

/**
 * All starts with here
 */
export class BrowserWindow extends AbsWindowIPC {
    static instance: BrowserWindow
    static getInstance(options?: BaseWindowConstructorOptions): BrowserWindow {
        if (!BrowserWindow.instance) {
            BrowserWindow.instance = new BrowserWindow(options)
        }
        return BrowserWindow.instance
    }

    constructor(options?: BaseWindowConstructorOptions) {
        super(options)

        Logger.getInstance().log('BrowserWindow::constructor')

        this.initBrowser()
        this.initCentre()

        /**
         * Restore status
         */
        const status = Status.getInstance()

        // Restore window size
        const bounds = status.getBounds(this.getBounds())
        this.setBounds(bounds)
    }

    private initBrowser() {
        this.browser = new BrowserView({
            webPreferences: {
                session: session.fromPartition('persist:my-partition'),
                partition: 'persist:my-partition',
            },
        })
        this.title = 'Loading...'
        // Events
        this.browser.webContents
            // Web Title to App Title
            .on('did-finish-load', () => {
                this.title = this.browser.webContents.getTitle()
            })
            .on('page-title-updated', (_, title) => {
                this.title = title
            })
            .on('will-navigate', () => (this.title = 'Loading...'))
            // Context Menu
            .on('context-menu', (_, params) => {
                const menu = this.getContextMenu(params)
                Menu.buildFromTemplate(menu).popup({
                    x: params.x,
                    y: params.y,
                })
            })

        this.contentView = this.browser
    }

    private initCentre() {
        const status = Status.getInstance()

        this.centre = new WebContentsView({
            webPreferences: {
                preload,
            },
        })
        this.centre.webContents
            .loadURL(resolveHtmlPath('index.html'))
            .then(() => {
                if (status.get('welcome')) {
                    this.title = 'Welcome to Focus!'
                    this.switch(PageType.WELCOME)
                    status.set('welcome', false)
                }
            })
            .catch((e) =>
                Logger.getInstance().error(
                    'Centre init failed',
                    JSON.stringify(e),
                ),
            )

        // Close action
        this.addListener('close', () => this.saveStatus())
    }

    /**
     * View controls
     */
    public switch(scene: Scenes) {
        this.current = scene
        if (scene === SceneBrowser.BROWSER) {
            this.contentView = this.browser
            if (this.browser.failedUrl) {
                this.title = 'Loading...'
                this.browser.reload()
            }
            return
        }

        this.contentView = this.centre
        this.centre.webContents.send(Channel.SWITCH, scene)
        this.centre.webContents.focus()
    }

    /**
     * Save current status when the app is closed
     */
    private saveStatus() {
        const status = Status.getInstance()
        const bounds = this.getBounds()
        status.setNumber('width', bounds.width)
        status.setNumber('height', bounds.height)
        status.setNumber('x', bounds.x)
        status.setNumber('y', bounds.y)
        status.save()

        // Save history
        if (this.browser && this.browser.webContents) {
            // Remove duplication
            let prevUrl = ''
            const entries = [
                ...this.browser.webContents.navigationHistory.getAllEntries(),
            ].filter((item) => {
                if (item.url !== prevUrl) {
                    prevUrl = item.url
                    return true
                }

                return false
            })

            // Find current index
            let index = 0
            const indexed =
                this.browser.webContents.navigationHistory.getAllEntries()[
                    this.browser.webContents.navigationHistory.getActiveIndex()
                ].url
            for (let [i, item] of entries.entries()) {
                if (item.url === indexed) {
                    index = i
                    break
                }
            }

            new History().write(index, entries, status.getNumber('maxHistory'))
        }

        // Save Popup Blocker
        PopupBlocker.getInstance().save()

        // Save Bookmark
        Bookmarks.getInstance().save()
        Anchors.getInstance().save()
    }

    reload() {
        if (this.current !== SceneBrowser.BROWSER) {
            return
        }
        this.browser.reload()
    }

    show() {
        if (this.current === SceneBrowser.BROWSER) {
            this.browser.webContents.focus()
        } else {
            this.centre.webContents.focus()
        }
        super.show()
    }
}
