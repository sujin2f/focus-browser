import { BrowserWindow, NavigationEntry } from 'electron'
import { message, resolveHtmlPath } from '@main/util'
import Bookmarks from '@src/main/modules/store/bookmarks'
import { preload } from '@main/util'
import { Bookmark, IPC_RequestHandler, IPC_Channels, Scenes } from '@src/types'
import Base from './base'
/**
 * ControlCentre scene
 * Searching, bookmarks, history, etc.
 */
export default class SceneControlCentre extends Base {
    private _parent: BrowserWindow
    public set parent(parent: BrowserWindow) {
        this._parent = parent
    }

    public show(scene: Scenes = Scenes.Home, url?: Bookmark) {
        if (!this._window) {
            this.createBrowser()
        }

        this._window.show()

        this._window.webContents.on('did-finish-load', () => {
            message.send(this._window, IPC_Channels.Switch, scene)
            if (url) {
                message.send(this._window, IPC_Channels.URL, url)
            }
        })

        if (!this._window.webContents.isLoading()) {
            message.send(this._window, IPC_Channels.Switch, scene)
            if (url) {
                message.send(this._window, IPC_Channels.URL, url)
            }
        }
    }

    private createBrowser() {
        this._window = new BrowserWindow({
            show: false,
            width: 1024,
            height: 728,
            parent: this._parent,
            webPreferences: {
                preload,
                nodeIntegration: false,
                contextIsolation: true,
            },
        })

        this.setCallbacks()
        this._window.loadURL(resolveHtmlPath('index.html'))
    }

    public sendBookmarks() {
        if (!this._window) {
            return
        }
        const bookmarks = Bookmarks.getInstance().get()
        message.send(
            this._window,
            IPC_Channels.Bookmarks,
            IPC_RequestHandler.Response,
            bookmarks,
        )
    }

    public sendHistory(history: NavigationEntry[]) {
        if (!this._window) {
            return
        }
        message.send(
            this._window,
            IPC_Channels.History,
            IPC_RequestHandler.Response,
            history,
        )
    }
}
