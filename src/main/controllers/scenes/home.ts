import { BrowserWindow, NavigationEntry } from 'electron'
import { message, resolveHtmlPath } from '@main/util'
import Bookmarks from '@main/controllers/store/bookmarks'
import { preload } from '@main/util'
import { Bookmark, IPC_RequestHandler, IPC_Channels, Scenes } from '@src/types'
/**
 * Home scene
 * Searching, bookmarks, history, etc.
 */
export default class SceneHome {
    // Singleton instance
    static instance: SceneHome

    static getInstance(): SceneHome {
        if (!SceneHome.instance) {
            SceneHome.instance = new SceneHome()
        }
        return SceneHome.instance
    }

    // Browser window
    private window: BrowserWindow | null

    public show(scene: Scenes = Scenes.Home) {
        if (this.window) {
            this.window.destroy()
        }

        this.window = new BrowserWindow({
            show: false,
            width: 1024,
            height: 728,
            webPreferences: {
                preload,
                nodeIntegration: false,
                contextIsolation: true,
            },
        })

        this.window.on('closed', () => {
            this.window = null
        })

        const url = new URL(resolveHtmlPath('index.html'))

        if (scene === Scenes.Address) {
            url.searchParams.append('location', 'true')
        }

        this.window.loadURL(url.toString())
        this.window.show()
    }

    public sendBookmarks(location: Bookmark) {
        if (!this.window) {
            return
        }
        const bookmarks = Bookmarks.getInstance().get()
        message.send(
            this.window,
            IPC_Channels.Bookmarks,
            IPC_RequestHandler.Response,
            location,
            bookmarks,
        )
    }

    public sendHistory(history: NavigationEntry[]) {
        if (!this.window) {
            return
        }
        message.send(
            this.window,
            IPC_Channels.History,
            IPC_RequestHandler.Response,
            history,
        )
    }

    public hide() {
        if (this.window) {
            this.window.destroy()
        }

        this.window = null
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
