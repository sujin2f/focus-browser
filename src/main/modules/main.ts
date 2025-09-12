import SceneWebBrowser from '@src/main/modules/scenes/web-browser'
import SceneControlCentre from '@src/main/modules/scenes/control-centre'
import AbsMenuBuilder, {
    CustomMenuItemConstructor,
} from '@src/main/modules/menu-builder'
import Bookmarks from '@src/main/modules/store/bookmarks'
import { Bookmark, IPC_RequestHandler, IPC_Channels, Scenes } from '@src/types'
import { menu } from '@main/settings/menu'
import { message } from '@main/util'

/**
 * Main application controller
 *
 * Handles switching between different scenes (views) in the application
 * Handles IPC communication
 */
export default class Main extends AbsMenuBuilder {
    // Singleton instance
    static instance: Main

    static getInstance(): Main {
        if (!Main.instance) {
            Main.instance = new Main()
        }
        return Main.instance
    }

    // Scene instances
    private sceneWebBrowser: SceneWebBrowser
    private sceneControlCentre: SceneControlCentre
    private currentScene: Scenes = Scenes.Browser

    menu: CustomMenuItemConstructor[] = menu({
        address: () => this.switch(Scenes.Address),
        home: () => this.switch(Scenes.Home),
        reload: () => {
            if (this.currentScene === Scenes.Browser) {
                this.sceneWebBrowser.reload()
            }
        },
        stop: () => {
            if (this.currentScene === Scenes.Browser) {
                this.sceneWebBrowser.stop()
            }
        },
        fullscreen: () => {
            if (this.currentScene === Scenes.Browser) {
                this.sceneWebBrowser.setFullScreen(true)
                return
            }

            this.sceneControlCentre.setFullScreen(true)
        },
        devtool: () => {
            if (this.currentScene === Scenes.Browser) {
                this.sceneWebBrowser.toggleDevTools()
                return
            }

            this.sceneControlCentre.toggleDevTools()
        },
        historyBack: () => {
            if (this.currentScene === Scenes.Browser) {
                this.sceneWebBrowser.historyBack()
            }
        },
        historyForward: () => {
            if (this.currentScene === Scenes.Browser) {
                this.sceneWebBrowser.historyForward()
            }
        },
        addBookmark: () => {
            if (this.currentScene === Scenes.Browser) {
                Bookmarks.getInstance().push({
                    url: this.sceneWebBrowser.url,
                    title: this.sceneWebBrowser.title,
                })
            }
        },
    })

    /**
     * Constructor
     * Initializes the application and sets the initial scene to the web browser
     */
    constructor() {
        super()
        this.sceneWebBrowser = new SceneWebBrowser()
        this.sceneControlCentre = new SceneControlCentre()
        this.sceneControlCentre.parent = this.sceneWebBrowser.window

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
            async (
                handler: IPC_RequestHandler,
                bookmark: Bookmark,
                index: number,
            ) => {
                switch (handler) {
                    case IPC_RequestHandler.Request:
                        this.sceneControlCentre.sendBookmarks()
                        return
                    case IPC_RequestHandler.Add:
                        Bookmarks.getInstance().push(bookmark)
                        return
                    case IPC_RequestHandler.Modify:
                        Bookmarks.getInstance().edit(index, bookmark)
                        return
                    case IPC_RequestHandler.Remove:
                        Bookmarks.getInstance().remove(
                            bookmark as unknown as number,
                        )
                        return
                }
            },
        )

        // History
        message.on(
            IPC_Channels.History,
            async (handler: IPC_RequestHandler, index: number) => {
                switch (handler) {
                    case IPC_RequestHandler.Request:
                        this.sceneControlCentre.sendHistory(
                            this.sceneWebBrowser.history,
                        )
                        return

                    case IPC_RequestHandler.Execute:
                        this.switch(Scenes.Browser)
                        this.sceneWebBrowser.goToIndex(index)
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
            this.sceneControlCentre.hide()
            if (url) {
                this.sceneWebBrowser.loadURL(url)
            } else {
                this.sceneWebBrowser.show()
            }
            this.currentScene = Scenes.Browser
            return
        }

        this.sceneWebBrowser.hide()
        this.sceneControlCentre.show(scene, {
            url: this.sceneWebBrowser.url,
            title: this.sceneWebBrowser.title,
        })
        this.currentScene = Scenes.Home
    }

    /**
     * On macOS it's common to re-create a window in the app when the
     * dock icon is clicked and there are no other windows open.
     * This method refreshes the current scene
     */
    refresh() {
        if (this.currentScene === Scenes.Browser) {
            this.sceneControlCentre.hide()
            this.sceneWebBrowser.show()
            return
        }
        this.sceneWebBrowser.hide()
        this.sceneControlCentre.show()
    }
}
