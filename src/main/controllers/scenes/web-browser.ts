import { BrowserView, BrowserWindow, NavigationEntry, session } from 'electron'
import { preload } from '@main/util'
import HistoryContainer from '@controllers/store/history'
export default class SceneWebBrowser {
    // Singleton instance
    static instance: SceneWebBrowser

    static getInstance(): SceneWebBrowser {
        if (!SceneWebBrowser.instance) {
            SceneWebBrowser.instance = new SceneWebBrowser()
        }
        return SceneWebBrowser.instance
    }

    // Browser window
    private window: BrowserWindow
    private homepage: string = 'https://www.google.com'

    constructor() {
        this.window = this.createWindow()
        const history = HistoryContainer.getInstance().current
        if (history) {
            this.homepage = history.url
        }
        this.loadURL(this.homepage)
    }

    public get title() {
        if (this.window) {
            return this.window.getTitle()
        }
        return ''
    }

    public get url() {
        if (this.window) {
            return this.window.webContents.getURL()
        }
        return ''
    }

    private createWindow() {
        if (this.window) {
            this.window.webContents.removeAllListeners()
            this.window.webContents.close()
            this.window.removeAllListeners()
            this.window.close()
        }

        this.window = new BrowserWindow({
            show: false,
            width: 1024,
            height: 728,
            webPreferences: {
                preload,
                session: session.fromPartition('persist:my-partition'),
                partition: 'persist:my-partition',
                nodeIntegration: false,
                contextIsolation: true,
            },
        })

        // Restore History
        const entries = HistoryContainer.getInstance().get(
            'history',
        ) as NavigationEntry[]
        const index = HistoryContainer.getInstance().get('index') as number
        this.window.webContents.navigationHistory.restore({ index, entries })

        this.setCallbacks()
        return this.window
    }

    private setCallbacks() {
        this.window.on('ready-to-show', () => {
            if (!this.window) {
                throw new Error(
                    `"window" is not defined for page: ${this.homepage}`,
                )
            }
            this.show()
        })

        this.window.on('close', () => {
            this.getHistory()
        })

        this.window.on('closed', () => {
            this.window = null
        })

        // Open urls in the user's browser
        this.window.webContents.setWindowOpenHandler((data) => {
            // Ad Block
            if (data.features) {
                return
            }
            if (data.disposition !== 'foreground-tab') {
                return
            }
            this.loadURL(data.url)
            return { action: 'deny' }
        })
    }

    /**
     * Load a URL in the current window
     * @param url URL to load
     */
    public loadURL(url: string) {
        this.window.webContents.stop()
        let _url = url

        // A regular expression to check if a schema (e.g., 'http://', 'https://', 'ftp://') is present.
        const hasSchema = /^[a-z]+:\/\//i.test(_url)

        // If the schema is missing, prepend 'http://' to allow the URL constructor
        // to correctly parse it. This handles cases like 'www.google.com' or 'google.com'.
        try {
            if (!hasSchema) {
                _url = new URL(_url).toString()
            }

            this.window.loadURL(_url).catch(() => {
                // If loading the URL fails (e.g., invalid URL), perform a search instead
                // TODO search engine option
                _url = `https://www.google.com/search?q=${url}`
                this.window.loadURL(_url)
            })
        } catch {
            _url = `https://www.google.com/search?q=${url}`
            this.window.loadURL(_url)
        }

        this.homepage = _url
        this.show()
    }

    public show() {
        this.window.show()
    }

    public hide() {
        this.window.hide()
    }

    public reload() {
        this.window.reload()
    }

    public setFullScreen(fullscreen: boolean) {
        this.window.setFullScreen(fullscreen)
    }

    public toggleDevTools() {
        this.window.webContents.toggleDevTools()
    }

    public getHistory() {
        console.log(this.window.isEnabled())
        if (!this.window.isEnabled()) {
            return []
        }
        const history =
            this.window.webContents.navigationHistory.getAllEntries()
        const index = this.window.webContents.navigationHistory.getActiveIndex()
        HistoryContainer.getInstance().push(index, history)
        return history
    }

    public historyBack() {
        if (this.window.webContents.navigationHistory.canGoBack()) {
            this.window.webContents.navigationHistory.goBack()
        }
    }

    public historyForward() {
        if (this.window.webContents.navigationHistory.canGoForward()) {
            this.window.webContents.navigationHistory.goForward()
        }
    }

    public goToIndex(index: number) {
        if (this.window.webContents.navigationHistory.length() > index) {
            this.window.webContents.navigationHistory.goToIndex(index)
        }
    }
}
