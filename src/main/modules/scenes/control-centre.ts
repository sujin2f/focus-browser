import { BrowserWindow, NavigationEntry } from 'electron'
import { message, resolveHtmlPath } from '@main/util'
import Bookmarks from '@src/main/modules/store/bookmarks'
import { preload } from '@main/util'
import { Bookmark, IPC_RequestHandler, IPC_Channels, Scenes } from '@src/types'
import Base from './base'
import Logger from '../logger'

/**
 * ControlCentre scene
 * Searching, bookmarks, history, etc.
 */
export default class SceneControlCentre extends Base {
    private _parent: BrowserWindow
    public set parent(parent: BrowserWindow) {
        this._parent = parent
    }

    constructor() {
        super()
        this._window = this.createWindow()
        this.setCallbacks()
        this._window.loadURL(resolveHtmlPath('index.html'))
    }

    public show(scene: Scenes = Scenes.Home, url?: Bookmark) {
        this._window.show()

        this._window.webContents.on('did-finish-load', () => {
            Logger.getInstance().info(
                'SceneControlCentre::show()::did-finish-load',
            )
            message.send(this._window, IPC_Channels.Switch, scene)
            if (url) {
                message.send(this._window, IPC_Channels.URL, url)
            }
        })

        if (!this._window.webContents.isLoading()) {
            Logger.getInstance().info('SceneControlCentre::show()::isLoading')
            message.send(this._window, IPC_Channels.Switch, scene)
            if (url) {
                message.send(this._window, IPC_Channels.URL, url)
            }
        }
    }

    private createWindow() {
        return new BrowserWindow({
            show: false,
            width: 1024,
            height: 728,
            parent: this._parent,
            webPreferences: {
                preload,
                contextIsolation: true,
            },
        })
    }

    protected setCallbacks() {
        super.setCallbacks()

        this._window.on('ready-to-show', () => {
            if (!this._window) {
                throw new Error(`"_window" is not defined`)
            }
            this.show()
        })
    }

    public sendBookmarks() {
        if (!this._window) {
            return
        }
        const bookmarks = Bookmarks.getInstance().get()
        Logger.getInstance().info('SceneControlCentre::sendBookmarks()')
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
        Logger.getInstance().info('SceneControlCentre::sendHistory()')
        message.send(
            this._window,
            IPC_Channels.History,
            IPC_RequestHandler.Response,
            history,
        )
    }
}
