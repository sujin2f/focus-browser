import { ipcMain } from 'electron'

import SceneWebBrowser from '@controllers/scenes/web-browser'
import SceneHome from '@controllers/scenes/home'
import AbsMenuBuilder, {
    CustomMenuItemConstructor,
} from '@controllers/menu-builder'
import Bookmarks from '@controllers/store/bookmarks'
import { Bookmark, IPC_RequestHandler, IPC_Channels, Scenes } from '@src/types'
import { menu } from '@main/settings/menu'
import { message } from '@main/util'
import Histories from './store/histories'

/**
 * Main application controller
 *
 * Handles switching between different scenes (views) in the application
 * Handles IPC communication
 */
export default class Main extends AbsMenuBuilder {
    // Singleton instance
    /* eslint-disable-next-line no-use-before-define */
    static instance: Main

    static getInstance(): Main {
        if (!Main.instance) {
            Main.instance = new Main()
        }
        return Main.instance
    }

    // Scene instances
    private sceneWebBrowser: SceneWebBrowser = SceneWebBrowser.getInstance()
    private sceneHome: SceneHome = SceneHome.getInstance()
    private currentScene: Scenes = Scenes.Browser

    menu: CustomMenuItemConstructor[] = menu({
        address: () => this.switch(Scenes.Address),
        home: () => this.switch(Scenes.Home),
        reload: () => {
            if (this.currentScene === Scenes.Browser) {
                this.sceneWebBrowser.reload()
                return
            }

            this.sceneHome.reload()
        },
        fullscreen: () => {
            if (this.currentScene === Scenes.Browser) {
                this.sceneWebBrowser.setFullScreen(true)
                return
            }

            this.sceneHome.setFullScreen(true)
        },
        devtool: () => {
            if (this.currentScene === Scenes.Browser) {
                this.sceneWebBrowser.toggleDevTools()
                return
            }

            this.sceneHome.toggleDevTools()
        },
        historyBack: () => {
            const back = Histories.getInstance().back()
            if (back) {
                this.sceneWebBrowser.loadURL(back.url)
            }
        },
        historyForward: () => {
            const forward = Histories.getInstance().forward()
            if (forward) {
                this.sceneWebBrowser.loadURL(forward.url)
            }
        },
    })

    /**
     * Constructor
     * Initializes the application and sets the initial scene to the web browser
     */
    constructor() {
        super()
        this.initIPC()
        this.buildMenu()
    }

    /**
     * Initializes IPC communication
     */
    private initIPC() {
        // Switch to web browser scene
        message.on(
            IPC_Channels.Switch,
            async (scene: Scenes, address?: string) => {
                switch (scene) {
                    case Scenes.Browser:
                        if (address) {
                            this.switch(Scenes.Browser, address)
                            return
                        }
                        this.switch(Scenes.Browser)
                }
            },
        )

        // Bookmarks
        message.on(
            IPC_Channels.Bookmarks,
            async (handler: IPC_RequestHandler, bookmark: Bookmark) => {
                switch (handler) {
                    case IPC_RequestHandler.Request:
                        const location = {
                            url: this.sceneWebBrowser.url,
                            title: this.sceneWebBrowser.title,
                        }
                        this.sceneHome.sendBookmarks(location)
                        return
                    case IPC_RequestHandler.Add:
                        Bookmarks.getInstance().add(bookmark)
                        return
                }
            },
        )

        // History
        message.on(
            IPC_Channels.History,
            async (handler: IPC_RequestHandler) => {
                switch (handler) {
                    case IPC_RequestHandler.Request:
                        this.sceneHome.sendHistory()
                        return
                }
            },
        )
    }

    /**
     * Switches between different scenes
     *
     * @param {Scenes} scene The scene to switch to
     * @param {string} url Optional URL to load in the web browser scene
     */
    private switch(scene: Scenes, url?: string) {
        // Browser scene
        if (scene === Scenes.Browser) {
            this.sceneHome.hide()
            if (url) {
                this.sceneWebBrowser.loadURL(url)
            } else {
                this.sceneWebBrowser.show()
            }
            this.currentScene = Scenes.Browser
            return
        }

        this.sceneWebBrowser.hide()
        this.sceneHome.show(scene)
        this.currentScene = Scenes.Home
    }

    /**
     * On macOS it's common to re-create a window in the app when the
     * dock icon is clicked and there are no other windows open.
     * This method refreshes the current scene
     */
    refresh() {
        if (this.currentScene === Scenes.Browser) {
            this.sceneHome.hide()
            this.sceneWebBrowser.show()
            return
        }
        this.sceneWebBrowser.hide()
        this.sceneHome.show()
    }
}
