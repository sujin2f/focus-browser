import {
    WebContentsView,
    Notification,
    type WebContentsViewConstructorOptions,
} from 'electron'
import { ElectronBlocker } from '@main/modules/adblocker-electron'
import fetch from 'cross-fetch'

import type { Bookmark } from '@src/types'
import { PageType, SearchEngine } from '@src/constants'
import { Logger } from '@main/modules/logger'

import { PopupBlocker } from '@src/main/modules/store/popup-blocker'
import { History } from '@main/modules/store/history'
import { Status } from '@main/modules/store/status'

import { BrowserWindow } from '@main/modules/window/window'

export class BrowserView extends WebContentsView {
    public get url(): Bookmark {
        return {
            title: this.webContents.getTitle(),
            url: this.webContents.getURL(),
        }
    }

    private _blocker?: ElectronBlocker | false = null
    public get blocker() {
        return this._blocker
    }

    private _failedUrl?: string
    public get failedUrl() {
        return this._failedUrl
    }

    /**
     * Constants
     */
    private readonly DEFAULT_URL = 'https://duckduckgo.com/'

    constructor(options: WebContentsViewConstructorOptions) {
        super(options)
        BrowserWindow.getInstance().title = 'Loading...'

        this.setPopupBlocker()
        // Events

        this.webContents
            // Web Title to App Title
            .on('did-finish-load', () => {
                BrowserWindow.getInstance().title = this.webContents.getTitle()
            })
            .on('page-title-updated', (_, title) => {
                BrowserWindow.getInstance().title = title
            })
            .on(
                'will-navigate',
                () => (BrowserWindow.getInstance().title = 'Loading...'),
            )
            // Context Menu
            .on('context-menu', (_, params) => {
                BrowserWindow.getInstance().showContextMenu(params)
            })

        // Enable pinch zoom
        this.webContents.setVisualZoomLevelLimits(1, 3)
        this.webContents.setZoomFactor(1)

        const url = this.restoreHistory() || this.DEFAULT_URL
        Logger.getInstance().log('BrowserView::constructor()', url)
        this.loadURL(url)
    }

    /**
     * Load a URL in the browser view
     * @param url URL to load
     */
    public async loadURL(url: string) {
        this.webContents.stop()
        await this.setAdBlocker()
        let _url = url

        // A regular expression to check if a schema (e.g., 'http://', 'https://', 'ftp://') is present.
        const hasSchema = /^[a-z]+:\/\//i.test(_url)

        // If the schema is missing, prepend 'http://' to allow the URL constructor
        // to correctly parse it. This handles cases like 'www.google.com' or 'google.com'.
        Logger.getInstance().log('Try to load URL: ', _url, hasSchema)
        try {
            _url = !hasSchema ? new URL(`http://${_url}`).toString() : _url
        } catch {
            /* empty */
        }

        this.webContents.loadURL(_url).catch((e) => {
            // TODO for the network that needs login like public cafe
            Logger.getInstance().error('loadURL failed: ', JSON.stringify(e))
            if (e.code === 'ERR_INTERNET_DISCONNECTED') {
                this._failedUrl = _url
                BrowserWindow.getInstance().switch(PageType.OFFLINE)
                return
            }

            const searchEngine = Status.getInstance().get('searchEngine')
            this.webContents.loadURL(`${SearchEngine[searchEngine]}${url}`)
            this._failedUrl = null
        })
    }

    /**
     * Restore history from storage
     */
    private restoreHistory() {
        const history = new History()
        history.parse()

        if (!isNaN(history.get('index'))) {
            this.webContents.navigationHistory.restore({
                index: history.get('index'),
                entries: history.get('history'),
            })
        }

        if (history.current) {
            return history.current.url
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
                this._blocker = null
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
                BrowserWindow.getInstance().switch(PageType.POPUP_BLOCKER)
            })
            notification.show()
            return { action: 'deny' }
        })
    }

    /**
     * For preventing blank screen when ERR_INTERNET_DISCONNECTED happened
     */
    public reload() {
        BrowserWindow.getInstance().title = 'Reloading...'
        if (this._failedUrl) {
            this.loadURL(this._failedUrl)
            return
        }
        this.webContents.reload()
    }
}
