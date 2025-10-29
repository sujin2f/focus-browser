import {
    clipboard,
    Menu,
    nativeImage,
    WebContentsView,
    Notification,
    type WebContentsViewConstructorOptions,
    type ContextMenuParams,
    type MenuItemConstructorOptions,
    type MenuItem,
} from 'electron'
import { ElectronBlocker } from '@main/modules/adblocker-electron'
import fetch from 'cross-fetch'

import { Bookmark, PageType, Scenes } from '@src/types'
import Logger from '@main/modules/logger'

import PopupBlocker from '@main/modules/store/popup'
import History from '@main/modules/store/history'
import Status from '@main/modules/store/status'
import Bookmarks from '@main/modules/store/bookmarks'
import Anchors from '@main/modules/store/anchors'

export class BrowserView extends WebContentsView {
    public get url(): Bookmark {
        return {
            title: this.webContents.getTitle(),
            url: this.webContents.getURL(),
        }
    }

    private _blocker: ElectronBlocker
    public get blocker() {
        return this._blocker
    }

    public failedUrl?: string

    /**
     * Constants
     */
    private readonly DEFAULT_URL = 'https://duckduckgo.com/'

    constructor(
        options: WebContentsViewConstructorOptions,
        private switchMode: (scene: Scenes) => void,
    ) {
        super(options)

        this.setAdBlocker()
        this.setPopupBlocker()

        const url = this.restoreHistory() || this.DEFAULT_URL
        this.loadURL(url)

        // Enable pinch zoom
        this.webContents.setVisualZoomLevelLimits(1, 3)
        this.webContents.setZoomFactor(1)

        // Context Menu
        this.webContents.on('context-menu', this.showContextMenu.bind(this))
    }

    /**
     * Load a URL in the browser view
     * @param url URL to load
     */
    public loadURL(url: string) {
        this.webContents.stop()
        let _url = url

        // A regular expression to check if a schema (e.g., 'http://', 'https://', 'ftp://') is present.
        const hasSchema = /^[a-z]+:\/\//i.test(_url)

        // If the schema is missing, prepend 'http://' to allow the URL constructor
        // to correctly parse it. This handles cases like 'www.google.com' or 'google.com'.
        Logger.getInstance().error('Try to load URL: ', _url, hasSchema)
        try {
            _url = !hasSchema ? new URL(`http://${_url}`).toString() : _url
        } catch {}

        this.webContents.loadURL(_url).catch((e) => {
            // TODO for the network that needs login like public cafe
            Logger.getInstance().error('loadURL failed: ', JSON.stringify(e))
            if (e.code === 'ERR_INTERNET_DISCONNECTED') {
                this.failedUrl = _url
                this.switchMode(PageType.OFFLINE)
                return
            }

            this.webContents.loadURL(`https://duckduckgo.com/?q=${url}`)
            this.failedUrl = null
        })
    }

    /**
     * Restore history from storage
     */
    private restoreHistory() {
        const history = new History()
        history.parse()

        if (!isNaN(history.index)) {
            this.webContents.navigationHistory.restore({
                index: history.index,
                entries: history.entries,
            })
        }

        if (history.current) {
            return history.current.url
        }
        return ''
    }

    private async setAdBlocker() {
        if (!Status.getInstance().get('adBlocker')) {
            Logger.getInstance().log('Ad-Blocker is disabled.')
            return
        }

        ElectronBlocker.fromPrebuiltAdsAndTracking(fetch)
            .then((blocker) => {
                this._blocker = blocker
                this._blocker.enableBlockingInSession(this.webContents.session)
                Logger.getInstance().log('Ad-Blocker is enabled.')

                // For debug
                // blocker.on('request-blocked', (request) => {
                //     console.log('blocked', request.tabId, request.url)
                // })

                // blocker.on('request-redirected', (request) => {
                //     console.log('redirected', request.tabId, request.url)
                // })

                // blocker.on('request-whitelisted', (request) => {
                //     console.log('whitelisted', request.tabId, request.url)
                // })

                // blocker.on('csp-injected', (request, csps) => {
                //     console.log('csp', request.url, csps)
                // })

                // blocker.on('script-injected', (script: string, url: string) => {
                //     console.log('script', script.length, url)
                // })

                // blocker.on('style-injected', (style: string, url: string) => {
                //     console.log('style', style.length, url)
                // })

                // blocker.on(
                //     'filter-matched',
                //     console.log.bind(console, 'filter-matched'),
                // )
            })
            .catch((e: any) => {
                // TODO when network connection failed and reconnected, try to activate ad-blocker.
                Logger.getInstance().error(
                    'Ad-Blocker is failed to load: ',
                    JSON.stringify(e),
                )
            })
    }

    private setPopupBlocker() {
        this.webContents.setWindowOpenHandler((data) => {
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
                this.switchMode(PageType.POPUP_BLOCKER)
            })
            notification.show()
            return { action: 'deny' }
        })
    }

    private async showContextMenu(_: unknown, params: ContextMenuParams) {
        const menu: Array<MenuItemConstructorOptions | MenuItem> = [
            {
                label: 'Add Bookmark',
                click: () => this.addBookmark(),
            },
            {
                label: 'Add Anchor',
                click: () => this.addAnchor(),
            },
            { type: 'separator' },
            {
                label: 'Control Centre',
                click: () => this.switchMode(PageType.HOME),
            },
            {
                label: 'Back',
                click: () => this.webContents.navigationHistory.goBack(),
            },
            {
                label: 'Forward',
                click: () => this.webContents.navigationHistory.goForward(),
            },
        ]
        // only show the context menu if the element is editable
        if (params.hasImageContents) {
            Menu.buildFromTemplate([
                {
                    label: 'Copy Image',
                    click: () => this.copyImageToClipboard(params.srcURL),
                },
                {
                    label: 'Copy Image Address',
                    click: () => clipboard.writeText(params.srcURL),
                },
                { type: 'separator' },
                ...menu,
            ]).popup()
            return
        }

        if (params.linkURL) {
            Menu.buildFromTemplate([
                {
                    label: 'Copy Link URL',
                    click: () => clipboard.writeText(params.linkURL),
                },
                { type: 'separator' },
                ...menu,
            ]).popup()
            return
        }

        Menu.buildFromTemplate([...menu]).popup()
    }

    private async copyImageToClipboard(imageUrl: string) {
        try {
            await fetch(imageUrl).then(async (response) => {
                const blob = await (await response.blob()).arrayBuffer()
                const buffer = Buffer.from(blob)
                const image = nativeImage.createFromBuffer(buffer)
                clipboard.writeImage(image)
            })
        } catch (error) {
            Logger.getInstance().error(
                'Error fetching or processing image:',
                error,
            )
        }
    }

    /**
     * For preventing blank screen when ERR_INTERNET_DISCONNECTED happened
     */
    public reload() {
        if (this.failedUrl) {
            this.loadURL(this.failedUrl)
            return
        }
        this.webContents.reload()
    }

    public addBookmark() {
        const added = Bookmarks.getInstance().push({
            url: this.webContents.getURL(),
            title: this.webContents.getTitle(),
        })
        if (!added) {
            return
        }

        const notification = new Notification({
            title: 'Focus',
            body: 'New Bookmark Added',
            silent: true,
        })
        notification.addListener('click', () => {
            this.switchMode(PageType.BOOKMARK)
        })
        notification.show()
    }
    public addAnchor() {
        const added = Anchors.getInstance().push({
            url: this.webContents.getURL(),
            title: this.webContents.getTitle(),
        })

        if (!added) {
            return
        }

        const notification = new Notification({
            title: 'Focus',
            body: 'New Anchor Added',
            silent: true,
        })
        notification.addListener('click', () => {
            this.switchMode(PageType.ANCHOR)
        })
        notification.show()
    }
}
