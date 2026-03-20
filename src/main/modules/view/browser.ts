import { Notification, session, ipcMain, type Rectangle } from 'electron'
import { ElectronBlocker } from '@main/lib/adblocker-electron'
/* CONSTANTS */
import {
    IPC_CHANNELS,
    MainEventTypes,
    CENTRE_PAGES,
    SEARCH_ENGINES,
    SUJINC_DOMAIN,
    SUJINC_URL,
} from '@src/common/constants'
/* Models */
import { Logger } from '@src/common/logger'
import { PopupBlocker } from '@main/store/popup-blocker'
import { History } from '@main/store/history'
import { Status } from '@main/store/status'
import { Keystrokes } from '@main/store/keystrokes'
import { AbsContentsView } from '@src/main/modules/view/abs-content-view'
/* Utils */
import { getSafeUrl, isNatural } from '@src/common/utils/common'
import { ensureAccessToken } from '@src/child-process/entries/cloud'
import { refreshToken, verifyToken } from '@src/common/utils/security-electron'

export class BrowserView extends AbsContentsView {
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

    constructor() {
        super({
            webPreferences: {
                session: session.fromPartition('persist:my-partition'),
                partition: 'persist:my-partition',
                navigateOnDragDrop: true,
                contextIsolation: false,
            },
        })

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
            // TODO #156 Gesture Navigation
            .on('input-event', (_, __) => {
                // Logger.init().info(event)
            })

        this.webContents.setZoomFactor(1)
    }

    public backToBrowser() {
        Logger.init().log('backToBrowser()', this.initialized, this.url)

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
        Logger.init().log('loadURL', keyword)

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
            Logger.init().error('loadURL failed: ', JSON.stringify(e))
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
        Logger.init().log('restoreHistory')

        const history = new History()
        history.parse()

        const index = history.get('index')
        const entries = history.get('history')
        Logger.init().log('history.get(index)', index)
        Logger.init().log('history.length', entries.length)

        if (isNatural(index)) {
            Logger.init().info('history.entries[index]', {
                url: entries[index].url,
                title: entries[index].title,
            })

            this.webContents.navigationHistory
                .restore({
                    index,
                    entries: history.get('history'),
                })
                .catch((e) => {
                    Logger.init().error('restoring history', e)
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
        Logger.init().info('🚦AdBlocker is enabling with fetch: ', fetch.name)

        ElectronBlocker.fromPrebuiltAdsAndTracking(fetch)
            .then((blocker) => {
                blocker.enableBlockingInSession(this.webContents.session)
                this._blocker = blocker
                Logger.init().log('🚦AdBlocker is enabled.')

                // For debug or future usage
                blocker.on('request-blocked', (request) => {
                    Logger.init().log(
                        '🚦AdBlocker: blocked',
                        request.tabId,
                        request.url,
                    )
                })

                blocker.on('request-redirected', (request) => {
                    Logger.init().log(
                        '🚦AdBlocker: redirected',
                        request.tabId,
                        request.url,
                    )
                })

                blocker.on('request-whitelisted', (request) => {
                    Logger.init().log(
                        '🚦AdBlocker: whitelisted',
                        request.tabId,
                        request.url,
                    )
                })

                blocker.on('csp-injected', (request, csps) => {
                    Logger.init().log('🚦AdBlocker: csp', request.url, csps)
                })

                blocker.on('script-injected', (script: string, url: string) => {
                    Logger.init().log('🚦AdBlocker: script', script.length, url)
                })

                blocker.on('style-injected', (style: string, url: string) => {
                    Logger.init().log('🚦AdBlocker: style', style.length, url)
                })
            })
            .catch((e: unknown) => {
                this._blocker = undefined
                // TODO when network connection failed and reconnected, try to activate ad-blocker.
                Logger.init().error(
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
        // 🤬 Not Active
        if (!this.active) return

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
        // 🤬 Not Active
        if (!this.active) return

        this.initialized = true
        this.title = 'Reloading...'
        if (this._failedUrl) {
            this.loadURL(this._failedUrl)
            return
        }
        this.webContents.reload()
    }

    public resize(bounds: Rectangle) {
        this.setBounds({
            x: 0,
            y: 0,
            width: bounds.width,
            height: bounds.height,
        })
    }

    public scroll(type: 'top' | 'bottom') {
        // 🤬 Not Active
        if (!this.active) return

        if (type === 'top') {
            this.webContents.scrollToTop()
            return
        }
        this.webContents.scrollToBottom()
    }

    /**
     * 🪙 Get Access Token
     * @returns {Promise<string>}
     */
    private async getAccessToken(): Promise<string> {
        return await this.webContents.session.cookies
            .get({
                name: 'sujinc.com/access',
                domain: SUJINC_DOMAIN,
            })
            .then(async (cookies) => await verifyToken(cookies[0].value))
            .catch((e) => {
                throw Logger.init().throw(
                    'Error to get access token from cookie',
                    e.message,
                )
            })
    }

    /**
     * 🪙 Get Access Token. If not exist, refresh it
     * @returns {Promise<string>}
     */
    public async getSafeAccessToken(): Promise<string> {
        return await this.getAccessToken().catch(async () => {
            Logger.init().log('getSafeAccessToken()')

            // If not available, try refresh token
            const refresh = await this.getRefreshToken()

            return await refreshToken(refresh)
                .then(async (result) => {
                    await this.bakeAccessToken(result.token)
                    return result.token
                })
                .catch(async (e) => {
                    await this.removeCookies()
                    throw e
                })
        })
    }

    /**
     * 🪙 Get Refresh Token
     * @returns {Promise<string>}
     */
    private async getRefreshToken(): Promise<string> {
        return await this.webContents.session.cookies
            .get({
                name: 'sujinc.com/refresh',
                domain: SUJINC_DOMAIN,
            })
            .then(async (cookies) => await verifyToken(cookies[0].value))
            .catch(async (e) => {
                await this.removeCookies()
                throw e
            })
    }

    /**
     * 🪙 Remove sujinc.com cookies
     */
    private async removeCookies() {
        await this.webContents.session.cookies
            .remove(SUJINC_URL, 'sujinc.com/refresh')
            .catch(async (e) => {
                Logger.init().error('Failed to remove cookie', e.message)
            })

        await this.webContents.session.cookies
            .remove(SUJINC_URL, 'sujinc.com/access')
            .catch(async (e) => {
                Logger.init().error('Failed to remove cookie', e.message)
            })
        await this.webContents.session.cookies
            .remove(SUJINC_URL, 'sujinc.com/user-info')
            .catch(async (e) => {
                Logger.init().error('Failed to remove cookie', e.message)
            })
    }

    /**
     * 🪙 User Info
     */
    public async getUserInfo(): Promise<string> {
        Logger.init().log('getUserInfo()')

        const refresh = await this.getRefreshToken() // If not exist, throw
        this.getAccessToken().catch(() => ensureAccessToken(this, '', refresh))

        return await this.webContents.session.cookies
            .get({
                name: 'sujinc.com/user-info',
                domain: SUJINC_DOMAIN,
            })
            .then(async (cookies) => {
                const userInfo = cookies[0]
                if (!userInfo) {
                    await this.removeCookies()
                    throw Logger.init().throw('User info does not exist')
                }
                return decodeURIComponent(userInfo.value)
            })
    }

    public async bakeAccessToken(value: string) {
        const now = new Date().getTime() / 1000
        await this.webContents.session.cookies
            .set({
                url: SUJINC_URL,
                name: 'sujinc.com/access',
                value,
                domain: SUJINC_DOMAIN,
                path: '/',
                secure: true,
                httpOnly: true,
                expirationDate: now + 3 * 60 * 60,
                sameSite: 'lax',
            })
            .catch(async (e) => {
                throw Logger.init().throw(
                    'Failed to set cookie for access token: ',
                    e.message,
                )
            })
    }
}
