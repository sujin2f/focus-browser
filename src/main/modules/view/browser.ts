import {
    WebContentsView,
    Notification,
    type WebContentsViewConstructorOptions,
    ipcMain,
} from 'electron'
import { ElectronBlocker } from '@main/lib/adblocker-electron'
/* CONSTANTS */
import {
    IPC_CHANNELS,
    MainEventTypes,
    CENTRE_PAGES,
    SEARCH_ENGINES,
} from '@src/common/constants'
/* Models */
import { Logger } from '@main/lib/logger'
import { PopupBlocker } from '@main/store/popup-blocker'
import { History } from '@main/store/history'
import { Status } from '@main/store/status'
import { Keystrokes } from '@main/store/keystrokes'
/* Utils */
import { getSafeUrl, isNatural } from '@src/common/utils/common'

export class BrowserView extends WebContentsView {
    public get url(): string {
        return this.webContents.getURL()
    }

    private _blocker?: ElectronBlocker = undefined
    public get blocker() {
        return this._blocker
    }

    private _failedUrl?: string
    public get failedUrl() {
        return this._failedUrl
    }

    private initialized = false

    private set title(title: string) {
        ipcMain.emit(
            IPC_CHANNELS.MAIN_PROCESS,
            null,
            MainEventTypes.TITLE,
            title,
        )
    }

    constructor(options: WebContentsViewConstructorOptions) {
        super(options)

        ipcMain.emit(
            IPC_CHANNELS.MAIN_PROCESS,
            null,
            MainEventTypes.TITLE,
            'Welcome to Focus!',
        )

        this.setPopupBlocker()
        this.setAdBlocker()
        this.restoreHistory()

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
                this.title = title
            })
            .on('will-navigate', () => (this.title = 'Loading...'))
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

    public backToBrowser() {
        Logger.getInstance().log('backToBrowser()', this.url)

        if (!this.initialized && this.url) {
            this.initialized = true
            this.webContents.reload()
            return
        }

        if (this.url) {
            return
        }

        this.searchKeyword('')
    }

    /**
     * Load a URL in the browser view
     * @param keyword URL to load or search string
     */
    public async loadURL(keyword: string) {
        Logger.getInstance().log('loadURL', keyword)

        this.initialized = true
        const url = getSafeUrl(keyword)
        if (typeof url === 'undefined') {
            return
        }
        if (!url) {
            this.searchKeyword(keyword.trim())
            return
        }

        this.webContents.stop()
        await this.setAdBlocker()

        this.title = 'Loading...'
        await this.webContents.loadURL(url.toString()).catch((e) => {
            // TODO #50 for the network that needs login like public cafe
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

            this.searchKeyword(keyword)
        })
    }

    public searchKeyword(keyword: string) {
        this.initialized = true
        this._failedUrl = undefined
        const status = Status.getInstance()
        const searchEngine = status.get('searchEngine')
        this.loadURL(`${SEARCH_ENGINES[searchEngine]}${keyword}`)
    }

    /**
     * 📝 Restore history from storage
     */
    private restoreHistory() {
        Logger.getInstance().log('restoreHistory')

        const history = new History()
        history.parse()

        const index = history.get('index')
        const entries = history.get('history')
        Logger.getInstance().log('history.get(index)', index)
        Logger.getInstance().log('history.length', entries.length)

        if (isNatural(index)) {
            Logger.getInstance().info('history.entries[index]', {
                url: entries[index].url,
                title: entries[index].title,
            })

            this.webContents.navigationHistory
                .restore({
                    index,
                    entries: history.get('history'),
                })
                .catch((e) => {
                    Logger.getInstance().error('restoring history', e)
                })
            // Immediate stop for loading other location like bookmark
            this.webContents.stop()

            return true
        }
        return false
    }

    /**
     *  👮 Ad Blocker
     */
    public async setAdBlocker() {
        const status = Status.getInstance()
        const enabled = status.get('adBlocker')

        // Enabled and Set
        if (enabled && this._blocker) {
            return
        }
        // Disabled and UnSet
        if (!enabled && !this._blocker) {
            this._blocker = undefined
            return
        }
        // Disabled and Set : remove blocker
        if (!enabled && this._blocker) {
            this._blocker.disableBlockingInSession(this.webContents.session)
            this._blocker = undefined
            return
        }
        // Enabled and UnSet : Init
        Logger.getInstance().info(
            '🚦AdBlocker is enabling with fetch: ',
            fetch.name,
        )

        ElectronBlocker.fromPrebuiltAdsAndTracking(fetch)
            .then((blocker) => {
                blocker.enableBlockingInSession(this.webContents.session)
                this._blocker = blocker
                Logger.getInstance().log('🚦AdBlocker is enabled.')

                // For debug or future usage
                blocker.on('request-blocked', (request) => {
                    Logger.getInstance().log(
                        '🚦AdBlocker: blocked',
                        request.tabId,
                        request.url,
                    )
                })

                blocker.on('request-redirected', (request) => {
                    Logger.getInstance().log(
                        '🚦AdBlocker: redirected',
                        request.tabId,
                        request.url,
                    )
                })

                blocker.on('request-whitelisted', (request) => {
                    Logger.getInstance().log(
                        '🚦AdBlocker: whitelisted',
                        request.tabId,
                        request.url,
                    )
                })

                blocker.on('csp-injected', (request, csps) => {
                    Logger.getInstance().log(
                        '🚦AdBlocker: csp',
                        request.url,
                        csps,
                    )
                })

                blocker.on('script-injected', (script: string, url: string) => {
                    Logger.getInstance().log(
                        '🚦AdBlocker: script',
                        script.length,
                        url,
                    )
                })

                blocker.on('style-injected', (style: string, url: string) => {
                    Logger.getInstance().log(
                        '🚦AdBlocker: style',
                        style.length,
                        url,
                    )
                })
            })
            .catch((e: unknown) => {
                this._blocker = undefined
                // TODO when network connection failed and reconnected, try to activate ad-blocker.
                Logger.getInstance().error(
                    '🚦AdBlocker: Ad-Blocker is failed to load: ',
                    JSON.stringify(e),
                )

                const notification = new Notification({
                    title: 'Focus',
                    body: '🚦Ad-Blocker is failed to load',
                    silent: true,
                })
                notification.addListener('click', () => {
                    this.setAdBlocker()
                })
                notification.show()
            })
    }

    /**
     *  👮 Popup Blocker
     */
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
                body: `🚦Popup blocked from ${url.host}`,
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
        this.initialized = true
        this.title = 'Reloading...'
        if (this._failedUrl) {
            this.loadURL(this._failedUrl)
            return
        }
        this.webContents.reload()
    }
}
