import {
    session,
    BrowserWindow as ElectronBrowserWindow,
    WebContentsView,
    type BaseWindowConstructorOptions,
} from 'electron'

import { preload, resolveHtmlPath, message } from '@main/util'
import { Bookmark, IPC_Channels, IPC_RequestHandler, Scenes } from '@src/types'
import Logger from '@src/main/modules/logger'

import History from '@src/main/modules/store/history'
import Status from '@src/main/modules/store/status'
import Bookmarks from '@src/main/modules/store/bookmarks'
import PopupBlocker from '@src/main/modules/store/popup'
import Anchors from '@src/main/modules/store/anchors'

import MenuBuilder, {
    CustomMenuItemConstructor,
} from '@src/main/modules/menu-builder'
import { menu } from '@src/main/settings/menu'

import { BrowserView } from '@src/main/modules/scenes/browser'
import Popup from '@src/main/modules/store/popup'

class WithIPC extends ElectronBrowserWindow {
    protected browser: BrowserView
    protected centre: WebContentsView
    protected current: Scenes = Scenes.Browser
    protected setCurrent(_: Scenes) {
        throw new Error('Method not implemented.')
    }

    constructor(options?: BaseWindowConstructorOptions) {
        super(options)

        this.setIpcHandlers()
    }

    protected sendPageInfo(scene: Scenes) {
        message.send(
            this.centre.webContents,
            IPC_Channels.Switch,
            scene,
            this.browser.url,
        )
    }

    private setIpcHandlers() {
        // Switch to web browser scene
        message.on(
            IPC_Channels.Switch,
            async (scene: Scenes, address?: string, anchorIndex?: number) => {
                this.setCurrent(scene)

                if (scene === Scenes.Browser && address) {
                    this.browser.loadURL(address)
                }

                if (typeof anchorIndex === 'number') {
                    Logger.getInstance().info('Anchor removed: ', anchorIndex)
                    Anchors.getInstance().remove(anchorIndex)
                }
            },
        )

        // History
        message.on(
            IPC_Channels.History,
            async (handler: IPC_RequestHandler, index: number) => {
                switch (handler) {
                    case IPC_RequestHandler.Request:
                        message.send(
                            this.centre.webContents,
                            IPC_Channels.History,
                            IPC_RequestHandler.Response,
                            this.browser.webContents.navigationHistory.getAllEntries(),
                        )

                        return

                    case IPC_RequestHandler.Execute:
                        this.setCurrent(Scenes.Browser)
                        this.browser.webContents.navigationHistory.goToIndex(
                            index,
                        )
                        return
                }
            },
        )

        // IPC Bookmarks
        message.on(
            IPC_Channels.Bookmarks,
            async (
                handler: IPC_RequestHandler,
                bookmark: Bookmark,
                index: number,
            ) => {
                switch (handler) {
                    case IPC_RequestHandler.Request:
                        const bookmarks = Bookmarks.getInstance().get()
                        message.send(
                            this.centre.webContents,
                            IPC_Channels.Bookmarks,
                            IPC_RequestHandler.Response,
                            bookmarks,
                        )
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

        // IPC Anchors
        message.on(
            IPC_Channels.Anchors,
            async (handler: IPC_RequestHandler) => {
                switch (handler) {
                    case IPC_RequestHandler.Request:
                        const bookmarks = Anchors.getInstance().get()
                        message.send(
                            this.centre.webContents,
                            IPC_Channels.Anchors,
                            IPC_RequestHandler.Response,
                            bookmarks,
                        )
                        return
                }
            },
        )

        // IPC PopupBlockers
        message.on(
            IPC_Channels.PopupBlocker,
            async (handler: IPC_RequestHandler) => {
                switch (handler) {
                    case IPC_RequestHandler.Request:
                        const blocked = Popup.getInstance().get('blocked')
                        const allowed = Popup.getInstance().get('allowed')
                        message.send(
                            this.centre.webContents,
                            IPC_Channels.PopupBlocker,
                            IPC_RequestHandler.Response,
                            Array.from(blocked as string[]),
                            Array.from(allowed as string[]),
                        )
                        return
                }
            },
        )
    }
}

/**
 * All starts with here
 */
export default class BrowserWindow extends WithIPC {
    /**
     * View controls
     */
    protected setCurrent(scene: Scenes) {
        if (scene !== Scenes.Browser && !this.centre.webContents.getURL()) {
            this.centre.webContents.loadURL(resolveHtmlPath('index.html'))
        }
        this.current = scene

        if (scene === Scenes.Browser) {
            this.contentView = this.browser
        } else {
            this.contentView = this.centre

            if (this.centre.webContents.isLoading()) {
                this.centre.webContents.once('did-finish-load', () => {
                    this.sendPageInfo(scene)
                })
            } else {
                this.sendPageInfo(scene)
            }
            this.centre.webContents.focus()
        }
    }

    /**
     * Constants
     */
    private readonly menu: CustomMenuItemConstructor[] = menu({
        address: () => (this.current = Scenes.Address),
        home: () => (this.current = Scenes.Home),
        reload: () => {
            if (this.current === Scenes.Browser) {
                this.browser.webContents.reload()
            }
        },
        stop: () => {
            if (this.current === Scenes.Browser) {
                this.browser.webContents.stop()
            }
        },
        fullscreen: () => {
            this.setFullScreen(true)
        },
        devtool: () => {
            if (this.current === Scenes.Browser) {
                this.browser.webContents.openDevTools()
                this.centre.webContents.closeDevTools()
                return
            }
            this.browser.webContents.closeDevTools()
            this.centre.webContents.openDevTools()
        },
        historyBack: () => {
            if (
                this.current === Scenes.Browser &&
                this.browser.webContents.navigationHistory.canGoBack()
            ) {
                this.browser.webContents.navigationHistory.goBack()
            }
        },
        historyForward: () => {
            if (
                this.current === Scenes.Browser &&
                this.browser.webContents.navigationHistory.canGoForward()
            ) {
                this.browser.webContents.navigationHistory.goForward()
            }
        },
        addBookmark: () => {
            if (this.current === Scenes.Browser) {
                Bookmarks.getInstance().push({
                    url: this.browser.webContents.getURL(),
                    title: this.browser.webContents.getTitle(),
                })
            }
        },
        addAnchor: () => {
            if (this.current === Scenes.Browser) {
                Anchors.getInstance().push({
                    url: this.browser.webContents.getURL(),
                    title: this.browser.webContents.getTitle(),
                })
            }
        },
    })

    constructor(options?: BaseWindowConstructorOptions) {
        Logger.getInstance().log('BaseWin::constructor()')
        super(options)
        this.autoHideMenuBar = true

        /**
         * Set views
         */
        this.browser = new BrowserView({
            webPreferences: {
                preload,
                session: session.fromPartition('persist:my-partition'),
                partition: 'persist:my-partition',
            },
        })
        this.centre = new WebContentsView({
            webPreferences: {
                preload,
            },
        })

        this.contentView = this.browser

        /**
         * Restore status
         */
        const status = new Status()

        // Restore window size
        const bounds = status.getBounds(this.getBounds())
        Logger.getInstance().log('Status', status.getBounds(), bounds)
        this.setBounds(bounds)

        this.setEventListeners()
        new MenuBuilder(this.menu)
    }

    private setEventListeners() {
        this.addListener('close', () => {
            this.saveStatus()
        })
    }

    /**
     * Save current status when the app is closed
     */
    private saveStatus() {
        Logger.getInstance().log('saveStatus')
        const status = new Status()
        const bounds = this.getBounds()
        Logger.getInstance().log('saveStatus::bounds', bounds)
        status.setNumber('width', bounds.width)
        status.setNumber('height', bounds.height)
        status.setNumber('x', bounds.x)
        status.setNumber('y', bounds.y)
        status.save()

        // Save history
        Logger.getInstance().log('saveStatus::history')
        if (this.browser.webContents) {
            const history = new History()
            Logger.getInstance().log(
                'saveStatus::history',
                this.browser.webContents.navigationHistory.getActiveIndex(),
            )
            history.write(
                this.browser.webContents.navigationHistory.getActiveIndex(),
                this.browser.webContents.navigationHistory.getAllEntries(),
                status.getNumber('maxHistory'),
            )
        }

        // Save Popup Blocker
        PopupBlocker.getInstance().save()
        Logger.getInstance().log(
            'saveStatus::popup',
            PopupBlocker.getInstance().get('blocked'),
        )

        // Save Bookmark
        Logger.getInstance().log(
            'saveStatus::bookmarks',
            Bookmarks.getInstance().get(),
        )
        Logger.getInstance().log(
            'saveStatus::anchors',
            Anchors.getInstance().get(),
        )
        Bookmarks.getInstance().save()
        Anchors.getInstance().save()
    }
}
