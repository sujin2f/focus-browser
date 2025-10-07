import {
    clipboard,
    Menu,
    nativeImage,
    WebContentsView,
    type WebContentsViewConstructorOptions,
} from 'electron'
import { ElectronBlocker } from '@main/modules/adblocker-electron'
import fetch from 'cross-fetch' // required 'fetch'

import { Bookmark } from '@src/types'
import Logger from '@main/modules/logger'

import History from '@main/modules/store/history'
import Status from '@main/modules/store/status'

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

    /**
     * Constants
     */
    private readonly DEFAULT_URL = 'https://duckduckgo.com/'

    constructor(options?: WebContentsViewConstructorOptions) {
        super(options || {})

        this.setAdBlocker()
        const url = this.restoreHistory() || this.DEFAULT_URL
        this.loadURL(url)

        // Enable pinch zoom
        this.webContents.setVisualZoomLevelLimits(1, 3)
        this.webContents.setZoomFactor(1)

        // Context Menu
        this.webContents.on('context-menu', async (_event, params) => {
            // only show the context menu if the element is editable
            if (params.hasImageContents) {
                const menu = Menu.buildFromTemplate([
                    {
                        label: 'Copy Image',
                        click: () => this.copyImageToClipboard(params.srcURL),
                    },
                    {
                        label: 'Copy Image Address',
                        click: () => clipboard.writeText(params.srcURL),
                    },
                ])
                menu.popup()
            }

            if (params.linkURL) {
                const menu = Menu.buildFromTemplate([
                    {
                        label: 'Copy Link URL',
                        click: () => clipboard.writeText(params.linkURL),
                    },
                ])
                menu.popup()
            }
        })
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

            this.webContents.loadURL(_url).catch(() => {
                Logger.getInstance().error('Filed to load URL: ', _url)
                _url = `https://duckduckgo.com/?q=${url}`
                this.webContents.loadURL(_url)
            })
        } catch {
            Logger.getInstance().error(
                'Filed to load URL (try/catch block): ',
                _url,
            )
            // When the navigation failed, search DuckDuckGo
            // TODO search engine option
            _url = `https://duckduckgo.com/?q=${url}`
            this.webContents.loadURL(_url)
        }
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
                Logger.getInstance().error('Ad-Blocker is failed to load: ', e)
            })
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
            console.error('Error fetching or processing image:', error)
        }
    }
}
