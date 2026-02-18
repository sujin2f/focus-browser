import {
    WebContentsView,
    Notification,
    type WebContentsViewConstructorOptions,
    ipcMain,
} from 'electron'
import { ElectronBlocker } from '@main/modules/adblocker-electron'
import fetch from 'cross-fetch'
import {
    IPC_CHANNELS,
    MainEventTypes,
    CENTRE_PAGES,
    SEARCH_ENGINES,
} from '@src/common/constants'
import { Logger } from '@src/common/logger'

import { PopupBlocker } from '@src/main/modules/store/popup-blocker'
import { History } from '@main/modules/store/history'
import { Status } from '@main/modules/store/status'
import { Keystrokes } from '@main/modules/store/keystrokes'
/* T_Types */
import type { T_Bookmark } from '@src/common/types'

export class BrowserView extends WebContentsView {
    public get url(): T_Bookmark {
        return {
            title: this.webContents.getTitle(),
            url: this.webContents.getURL(),
        }
    }

    private _blocker?: ElectronBlocker | false = undefined
    public get blocker() {
        return this._blocker
    }

    private _failedUrl?: string
    public get failedUrl() {
        return this._failedUrl
    }

    public initialized = false

    /**
     * Constants
     */
    private readonly DEFAULT_URL = 'https://duckduckgo.com/'

    constructor(options: WebContentsViewConstructorOptions) {
        super(options)

        ipcMain.emit(
            IPC_CHANNELS.MAIN_PROCESS,
            null,
            MainEventTypes.TITLE,
            'Welcome to Focus!',
        )

        this.setPopupBlocker()

        // Events
        this.webContents
            // Web Title to App Title
            .on('did-finish-load', () => {
                ipcMain.emit(
                    IPC_CHANNELS.MAIN_PROCESS,
                    null,
                    MainEventTypes.TITLE,
                    this.webContents.getTitle(),
                )
                this.webContents.setVisualZoomLevelLimits(1, 3)
            })
            .on('page-title-updated', (_, title) => {
                ipcMain.emit(
                    IPC_CHANNELS.MAIN_PROCESS,
                    null,
                    MainEventTypes.TITLE,
                    title,
                )
            })
            .on('will-navigate', () =>
                ipcMain.emit(
                    IPC_CHANNELS.MAIN_PROCESS,
                    null,
                    MainEventTypes.TITLE,
                    'Loading...',
                ),
            )
            // Context Menu
            .on('context-menu', (_, params) => {
                ipcMain.emit(
                    IPC_CHANNELS.MAIN_PROCESS,
                    null,
                    MainEventTypes.CONTEXT_MENU,
                    params,
                )
            })

        this.webContents.setZoomFactor(1)
    }

    public loadLastHistory() {
        Logger.getInstance().info('loadLastHistory')
        const url = this.restoreHistory() || this.DEFAULT_URL
        Logger.getInstance().info('url', url)
        this.loadURL(url)
    }

    /**
     * Load a URL in the browser view
     * @param keyword URL to load or search string
     */
    public async loadURL(keyword: string) {
        this.initialized = true
        const trimmed = keyword.trim()
        if (!keyword || !trimmed) {
            return
        }

        this.webContents.stop()
        await this.setAdBlocker()

        // A regular expression to check if a schema (e.g., 'http://', 'https://', 'ftp://') is present.
        const hasSchema = /^[a-z]+:\/\//i.test(trimmed)

        let url: URL
        try {
            url = new URL(hasSchema ? trimmed : `http://${trimmed}`)
        } catch {
            // Not URL
            this.searchKeyword(trimmed)
            return
        }

        // Search Keyword
        if (!url.hostname.includes('.')) {
            this.searchKeyword(trimmed)
            return
        }

        await this.webContents.loadURL(url.toString()).catch((e) => {
            // TODO for the network that needs login like public cafe
            Logger.getInstance().error('loadURL failed: ', JSON.stringify(e))
            if (e.code === 'ERR_INTERNET_DISCONNECTED') {
                this._failedUrl = url.toString()
                ipcMain.emit(
                    IPC_CHANNELS.MAIN_PROCESS,
                    null,
                    MainEventTypes.SWITCH,
                    CENTRE_PAGES.OFFLINE,
                )
                return
            }

            this.searchKeyword(trimmed)
        })
    }

    public searchKeyword(keyword: string) {
        const searchEngine = Status.getInstance().get('searchEngine')
        this._failedUrl = undefined
        this.loadURL(`${SEARCH_ENGINES[searchEngine]}${keyword}`)
    }

    /**
     * Restore history from storage
     */
    private restoreHistory() {
        Logger.getInstance().info('restoreHistory')
        const history = new History()
        history.parse()

        const index = history.get('index')
        Logger.getInstance().info('history.get(index)', index)

        if (!isNaN(index) && index !== -1) {
            this.webContents.navigationHistory.restore({
                index,
                entries: history.get('history'),
            })
        }

        const current = history.current
        Logger.getInstance().info('history.current', current)

        if (current) {
            return current.url
        }
        return ''
    }

    public async setAdBlocker() {
        const enabled = Status.getInstance().get('adBlocker')

        // Enabled and Set
        if (enabled && this._blocker) {
            return
        }
        // Disabled and UnSet
        if (!enabled && !this._blocker) {
            this._blocker = false
            return
        }
        // Disabled and Set : remove blocker
        if (!enabled && this._blocker) {
            this._blocker.disableBlockingInSession(this.webContents.session)
            this._blocker = false
            return
        }
        // Enabled and UnSet : Init
        await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch)
            .then((blocker) => {
                blocker.enableBlockingInSession(this.webContents.session)
                this._blocker = blocker
                Logger.getInstance().log('Ad-Blocker is enabled.')

                // For debug or future usage
                /*
                blocker.on('request-blocked', (request) => {
                    console.log('blocked', request.tabId, request.url)
                })

                blocker.on('request-redirected', (request) => {
                    console.log('redirected', request.tabId, request.url)
                })

                blocker.on('request-whitelisted', (request) => {
                    console.log('whitelisted', request.tabId, request.url)
                })

                blocker.on('csp-injected', (request, csps) => {
                    console.log('csp', request.url, csps)
                })

                blocker.on('script-injected', (script: string, url: string) => {
                    console.log('script', script.length, url)
                })

                blocker.on('style-injected', (style: string, url: string) => {
                    console.log('style', style.length, url)
                })

                blocker.on(
                    'filter-matched',
                    console.log.bind(console, 'filter-matched'),
                )
                */
            })
            .catch((e: unknown) => {
                this._blocker = undefined
                // TODO when network connection failed and reconnected, try to activate ad-blocker.
                Logger.getInstance().error(
                    'Ad-Blocker is failed to load: ',
                    JSON.stringify(e),
                )

                const notification = new Notification({
                    title: 'Focus',
                    body: 'Ad Blocker failed to load',
                    silent: true,
                })
                notification.addListener('click', () => {
                    this.setAdBlocker()
                })
                notification.show()
            })
    }

    private setPopupBlocker() {
        this.webContents.setWindowOpenHandler((data) => {
            if (data.url.startsWith('file:')) {
                return { action: 'allow' }
            }
            const url = new URL(data.url)
            if (PopupBlocker.getInstance().isAllowed(url.host)) {
                this.loadURL(url.toString())
                return { action: 'deny' }
            }

            PopupBlocker.getInstance().block(url.host)
            const notification = new Notification({
                title: 'Focus',
                body: `Popup blocked from ${url.host}`,
                silent: true,
            })
            notification.addListener('click', () => {
                ipcMain.emit(
                    IPC_CHANNELS.MAIN_PROCESS,
                    null,
                    MainEventTypes.SWITCH,
                    CENTRE_PAGES.POPUP_BLOCKER,
                )
            })
            notification.show()
            return { action: 'deny' }
        })
    }

    public pasteKeystrokes() {
        const host = new URL(this.webContents.getURL()).host
        let keystroke = Keystrokes.getInstance().getKeystroke(host)
        if (!keystroke) {
            return
        }

        while (keystroke) {
            const keyCode = keystroke.charAt(0)
            if (keyCode === '[') {
                if (keystroke.startsWith('[Tab]')) {
                    this.webContents.sendInputEvent({
                        keyCode: 'Tab',
                        type: 'keyDown',
                    })
                    this.webContents.sendInputEvent({
                        keyCode: 'Tab',
                        type: 'keyUp',
                    })
                    keystroke = keystroke.slice(5)
                    continue
                }

                if (keystroke.startsWith('[Space]')) {
                    this.webContents.sendInputEvent({
                        keyCode: 'Space',
                        type: 'keyDown',
                    })
                    this.webContents.sendInputEvent({
                        keyCode: 'Space',
                        type: 'keyUp',
                    })
                    keystroke = keystroke.slice(7)
                    continue
                }

                if (keystroke.startsWith('[Enter]')) {
                    this.webContents.sendInputEvent({
                        keyCode: 'Enter',
                        type: 'keyDown',
                    })
                    this.webContents.sendInputEvent({
                        keyCode: 'Enter',
                        type: 'keyUp',
                    })
                    keystroke = keystroke.slice(7)
                    continue
                }
            }

            this.webContents.sendInputEvent({ keyCode, type: 'char' })
            keystroke = keystroke.slice(1)
        }
    }

    /**
     * For preventing blank screen when ERR_INTERNET_DISCONNECTED happened
     */
    public reload() {
        ipcMain.emit(
            IPC_CHANNELS.MAIN_PROCESS,
            null,
            MainEventTypes.TITLE,
            'Reloading...',
        )
        if (this._failedUrl) {
            this.loadURL(this._failedUrl)
            return
        }
        this.webContents.reload()
    }
}
