import { BrowserWindow, session } from 'electron'
import { readFileSync, writeFileSync } from 'fs'
import { ElectronBlocker, fullLists } from '@ghostery/adblocker-electron'

import { preload } from '@main/util'
import History from '@src/main/modules/store/history'
import Status from '@src/main/modules/store/status'
import PopupBlocker from '@src/main/modules/store/popup'
import Base from './base'
import Bookmarks from '../store/bookmarks'

export default class SceneWebBrowser extends Base {
    private DEFAULT_URL = 'https://www.google.com'

    public get title() {
        if (this._window) {
            return this._window.getTitle()
        }
        return ''
    }

    public get url() {
        if (this._window) {
            return this._window.webContents.getURL()
        }
        return ''
    }

    public get history() {
        if (!this._window.isEnabled()) {
            return []
        }
        return this._window.webContents.navigationHistory.getAllEntries()
    }

    constructor() {
        super()
        this._window = this.createWindow()
        const url = this.restoreHistory()
        this.setCallbacks()
        this.loadURL(url || this.DEFAULT_URL)
    }

    private createWindow() {
        const status = new Status()
        status.parse()

        this._window = new BrowserWindow({
            width: status.getNumber('width'),
            height: status.getNumber('height'),
            autoHideMenuBar: true,
            webPreferences: {
                preload,
                session: session.fromPartition('persist:my-partition'),
                partition: 'persist:my-partition',
                nodeIntegrationInSubFrames: true,
            },
        })

        return this._window
    }

    private restoreHistory() {
        const history = new History()
        history.parse()

        if (history.index) {
            this._window.webContents.navigationHistory.restore({
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
        const blocker = await ElectronBlocker.fromLists(
            fetch,
            fullLists,
            {
                enableCompression: true,
            },
            {
                path: 'engine.bin',
                read: async (path: string) => readFileSync(path),
                write: async (path: string, buffer: Uint8Array) =>
                    writeFileSync(path, buffer),
            },
        )

        blocker.enableBlockingInSession(this._window.webContents.session)

        // Popup Blocker
        this._window.webContents.setWindowOpenHandler((data) => {
            if (PopupBlocker.getInstance().isAllowed(data.url)) {
                this.loadURL(data.url)
                return { action: 'deny' }
            }

            PopupBlocker.getInstance().block(data.url)
            return { action: 'deny' }
        })
    }

    protected setCallbacks() {
        super.setCallbacks()

        this._window.on('ready-to-show', () => {
            if (!this._window) {
                throw new Error(`"_window" is not defined`)
            }
            this.setAdBlocker()
            this.show()
        })

        this._window.on('close', () => {
            this.onClose()
        })
    }

    public onClose() {
        // Save width & height
        const status = new Status()
        const bounds = this._window.getBounds()
        status.setNumber('width', bounds.width)
        status.setNumber('height', bounds.height)
        status.save()

        // Save history
        if (this._window.webContents) {
            const history = new History()
            history.write(
                this._window.webContents.navigationHistory.getActiveIndex(),
                this._window.webContents.navigationHistory.getAllEntries(),
                status.getNumber('maxHistory'),
            )
        }

        // Save Popup Blocker
        PopupBlocker.getInstance().save()

        // Save Bookmark
        Bookmarks.getInstance().save()
    }

    /**
     * Load a URL in the current window
     * @param url URL to load
     */
    public loadURL(url: string) {
        this._window.webContents.stop()
        let _url = url

        // A regular expression to check if a schema (e.g., 'http://', 'https://', 'ftp://') is present.
        const hasSchema = /^[a-z]+:\/\//i.test(_url)

        // If the schema is missing, prepend 'http://' to allow the URL constructor
        // to correctly parse it. This handles cases like 'www.google.com' or 'google.com'.
        try {
            if (!hasSchema) {
                _url = new URL(_url).toString()
            }
            console.log(_url)

            this._window.loadURL(_url).catch(() => {
                // If loading the URL fails (e.g., invalid URL), perform a search instead
                // TODO search engine option
                _url = `https://www.google.com/search?q=${url}`
                this._window.loadURL(_url)
            })
        } catch {
            _url = `https://www.google.com/search?q=${url}`
            this._window.loadURL(_url)
        }

        this.show()
    }

    public show() {
        this._window.show()
    }

    public stop() {
        this._window.webContents.stop()
    }

    public historyBack() {
        if (this._window.webContents.navigationHistory.canGoBack()) {
            this._window.webContents.navigationHistory.goBack()
        }
    }

    public historyForward() {
        if (this._window.webContents.navigationHistory.canGoForward()) {
            this._window.webContents.navigationHistory.goForward()
        }
    }

    public goToIndex(index: number) {
        if (this._window.webContents.navigationHistory.length() > index) {
            this._window.webContents.navigationHistory.goToIndex(index)
        }
    }
}
