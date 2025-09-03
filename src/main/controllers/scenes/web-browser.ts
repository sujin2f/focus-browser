import { BrowserWindow, session, type Session } from 'electron'
import { preload } from '@main/util'
import Histories from '../store/histories'

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
    private session: Session = session.fromPartition('persist:my-partition')
    private homepage: string = 'https://www.google.com'
    private navigate: string = ''

    constructor() {
        this.window = this.createWindow()
        const history = Histories.getInstance().get()
        if (history) {
            this.homepage = history.url
        }
        this.loadURL()
    }

    public get title() {
        return this.window.getTitle()
    }

    public get url() {
        return this.window.webContents.getURL()
    }

    private createWindow() {
        if (this.window) {
            this.window.destroy()
        }

        this.window = new BrowserWindow({
            show: false,
            width: 1024,
            height: 728,
            webPreferences: {
                preload,
                session: this.session,
                partition: 'persist:my-partition',
            },
        })

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

        this.window.on('closed', () => {
            this.window = null
        })

        this.window.webContents.on('will-navigate', (e, url) => {
            // TODO remove
            console.log('history, will-navigate', e, url)
        })

        this.window.webContents.on('did-navigate', (e, url) => {
            // TODO remove
            console.log('history, did-navigate', e, url, this.title)
        })

        this.window.webContents.on('page-title-updated', () => {
            // TODO remove
            console.log('history, page-title-updated', this.title, this.url)
            Histories.getInstance().push({
                url: this.url,
                title: this.title,
            })
        })

        // Open urls in the user's browser
        this.window.webContents.setWindowOpenHandler((data) => {
            // TODO remove
            console.log('history, new window', data)
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
    public loadURL(url?: string) {
        this.createWindow()
        if (url) {
            this.homepage = url
        }

        // A regular expression to check if a schema (e.g., 'http://', 'https://', 'ftp://') is present.
        const hasSchema = /^[a-z]+:\/\//i.test(url)

        // If the schema is missing, prepend 'http://' to allow the URL constructor
        // to correctly parse it. This handles cases like 'www.google.com' or 'google.com'.
        try {
            const parsed = new URL(!hasSchema ? `http://${url}` : url)

            this.window.loadURL(parsed.toString()).catch(() => {
                // If loading the URL fails (e.g., invalid URL), perform a search instead
                // TODO search engine option
                this.window.loadURL(`https://www.google.com/search?q=${url}`)
            })
        } catch {
            this.window.loadURL(`https://www.google.com/search?q=${url}`)
        }

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
}
