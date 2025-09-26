import {
    WebContentsView,
    Notification,
    type WebContentsViewConstructorOptions,
} from 'electron'

import { Bookmark } from '@src/types'
import Logger from '@main/modules/logger'

import History from '@main/modules/store/history'
import PopupBlocker from '@main/modules/store/popup'

export class BrowserView extends WebContentsView {
    public get url(): Bookmark {
        return {
            title: this.webContents.getTitle(),
            url: this.webContents.getURL(),
        }
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
        try {
            if (!hasSchema) {
                _url = new URL(`http://${_url}`).toString()
            }

            this.webContents.loadURL(_url).catch(() => {
                // If loading the URL fails (e.g., invalid URL), perform a search instead
                // TODO search engine option
                _url = `https://duckduckgo.com/?q=${url}`
                this.webContents.loadURL(_url)
            })
        } catch {
            _url = `https://duckduckgo.com/search?q=${url}`
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

    private setAdBlocker() {
        import('@ghostery/adblocker-webextension').then((extension) => {
            extension.WebExtensionBlocker.fromPrebuiltAdsAndTracking()
                .then((blocker) => {
                    blocker.enableBlockingInBrowser(this)
                })
                .catch((e) => {
                    Logger.getInstance().info(
                        'Importing @ghostery/adblocker-webextension has been failed:',
                        e,
                    )
                    return
                })
        })

        // Popup Blocker
        this.webContents.setWindowOpenHandler((data) => {
            const url = new URL(data.url)
            if (PopupBlocker.getInstance().isAllowed(url.host)) {
                this.loadURL(data.url)
                return { action: 'deny' }
            }

            PopupBlocker.getInstance().block(url.host)
            new Notification({
                title: 'Focus',
                body: `Popup blocked from ${url.host}`,
                silent: true,
            }).show()
            return { action: 'deny' }
        })
    }
}
