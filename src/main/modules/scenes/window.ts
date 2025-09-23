import {
    session,
    BrowserWindow as ElectronBrowserWindow,
    WebContentsView,
    type BaseWindowConstructorOptions,
} from 'electron'

import { preload, resolveHtmlPath, message } from '@main/util'
import { Bookmark, Channel, RequestHandler, Scenes } from '@src/types'

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
    protected current: Scenes = Scenes.BROWSER
    protected switch(_: Scenes) {
        throw new Error('Method not implemented.')
    }

    constructor(options?: BaseWindowConstructorOptions) {
        super(options)

        message.on(Channel.PLATFORM, this.onPlatform.bind(this))
        message.on(Channel.SWITCH, this.onSwitch.bind(this))
        message.on(Channel.HISTORY, this.onHistory.bind(this))
        message.on(Channel.BOOKMARK, this.onBookmarks.bind(this))
        message.on(Channel.ANCHOR, this.onAnchors.bind(this))
        message.on(Channel.POPUP_BLOCKER, this.onPopupBlocker.bind(this))
    }

    protected sendPageInfo(scene: Scenes) {
        this.centre.webContents.send(Channel.SWITCH, scene, this.browser.url)
    }

    private onPlatform(handler: RequestHandler) {
        if (handler !== RequestHandler.REQUEST) {
            return
        }

        this.centre.webContents.send(
            Channel.PLATFORM,
            RequestHandler.RESPONSE,
            process.platform,
        )
    }

    private onSwitch(
        scene: Scenes,
        address?: string,
        handler?: RequestHandler,
    ) {
        this.switch(scene)

        if (scene === Scenes.BROWSER && address) {
            this.browser.loadURL(address)
        }

        if (handler === RequestHandler.REMOVE) {
            Anchors.getInstance().remove(address)
        }
    }

    private onHistory(handler: RequestHandler, index: number) {
        switch (handler) {
            case RequestHandler.REQUEST:
                this.centre.webContents.send(
                    Channel.HISTORY,
                    RequestHandler.RESPONSE,
                    this.browser.webContents.navigationHistory.getAllEntries(),
                )

                return

            case RequestHandler.EXECUTE:
                this.switch(Scenes.BROWSER)
                this.browser.webContents.navigationHistory.goToIndex(index)
                return
        }
    }

    private onBookmarks(
        handler: RequestHandler,
        bookmark: Bookmark,
        index: number,
    ) {
        switch (handler) {
            case RequestHandler.REQUEST:
                const bookmarks = Bookmarks.getInstance().get()
                this.centre.webContents.send(
                    Channel.BOOKMARK,
                    RequestHandler.RESPONSE,
                    bookmarks,
                )
                return
            case RequestHandler.ADD:
                Bookmarks.getInstance().push(bookmark)
                return
            case RequestHandler.MODIFY:
                Bookmarks.getInstance().edit(index, bookmark)
                return
            case RequestHandler.REMOVE:
                Bookmarks.getInstance().remove(bookmark as unknown as number)
                return
        }
    }

    private onAnchors(handler: RequestHandler, url: string) {
        switch (handler) {
            case RequestHandler.REQUEST:
                const bookmarks = Anchors.getInstance().get()
                this.centre.webContents.send(
                    Channel.ANCHOR,
                    RequestHandler.RESPONSE,
                    bookmarks,
                )
                return
            case RequestHandler.REMOVE:
                Anchors.getInstance().remove(url)
                return
        }
    }

    private onPopupBlocker(handler: RequestHandler, host: string) {
        switch (handler) {
            case RequestHandler.REQUEST:
                const blocked = Popup.getInstance().get('blocked')
                const allowed = Popup.getInstance().get('allowed')
                this.centre.webContents.send(
                    Channel.POPUP_BLOCKER,
                    RequestHandler.RESPONSE,
                    Array.from(blocked as string[]),
                    Array.from(allowed as string[]),
                )
                return

            case RequestHandler.MODIFY:
                Popup.getInstance().toggle(host)
                return
        }
    }
}

/**
 * All starts with here
 */
export default class BrowserWindow extends WithIPC {
    /**
     * Constants
     */
    private readonly menu: CustomMenuItemConstructor[] = menu({
        address: () => this.switch(Scenes.ADDRESS),
        home: () => this.switch(Scenes.HOME),
        reload: () => {
            if (this.current === Scenes.BROWSER) {
                this.browser.webContents.reload()
            }
        },
        stop: () => {
            if (this.current === Scenes.BROWSER) {
                this.browser.webContents.stop()
            }
        },
        fullscreen: () => {
            this.setFullScreen(true)
        },
        devtool: () => {
            if (this.current === Scenes.BROWSER) {
                this.browser.webContents.openDevTools()
                this.centre.webContents.closeDevTools()
                return
            }
            this.browser.webContents.closeDevTools()
            this.centre.webContents.openDevTools()
        },
        historyBack: () => {
            if (
                this.current === Scenes.BROWSER &&
                this.browser.webContents.navigationHistory.canGoBack()
            ) {
                this.browser.webContents.navigationHistory.goBack()
            }
        },
        historyForward: () => {
            if (
                this.current === Scenes.BROWSER &&
                this.browser.webContents.navigationHistory.canGoForward()
            ) {
                this.browser.webContents.navigationHistory.goForward()
            }
        },
        addBookmark: () => {
            if (this.current === Scenes.BROWSER) {
                Bookmarks.getInstance().push({
                    url: this.browser.webContents.getURL(),
                    title: this.browser.webContents.getTitle(),
                })
            }
        },
        addAnchor: () => {
            if (this.current === Scenes.BROWSER) {
                Anchors.getInstance().push({
                    url: this.browser.webContents.getURL(),
                    title: this.browser.webContents.getTitle(),
                })
            }
        },
    })

    constructor(options?: BaseWindowConstructorOptions) {
        super(options)
        this.autoHideMenuBar = true

        /**
         * Set views
         */
        this.browser = new BrowserView({
            webPreferences: {
                session: session.fromPartition('persist:my-partition'),
                partition: 'persist:my-partition',
            },
        })
        // Enable pinch zoom
        this.browser.webContents.setVisualZoomLevelLimits(1, 3)
        this.centre = new WebContentsView({
            webPreferences: {
                preload,
            },
        })
        // #20 Web Title to App Title
        this.browser.webContents.on('page-title-updated', (e, title) => {
            this.title = title
        })

        this.contentView = this.browser

        /**
         * Restore status
         */
        const status = Status.getInstance()

        // Restore window size
        const bounds = status.getBounds(this.getBounds())
        this.setBounds(bounds)

        this.setEventListeners()
        new MenuBuilder(this.menu)
    }

    /**
     * View controls
     */
    protected switch(scene: Scenes) {
        if (scene !== Scenes.BROWSER) {
            if (!this.centre.webContents.getURL()) {
                const status = Status.getInstance()
                if (status.get('welcome')) {
                    this.centre.webContents.loadURL(
                        resolveHtmlPath('welcome.html'),
                    )
                    status.set('welcome', false)
                } else {
                    this.centre.webContents.loadURL(
                        resolveHtmlPath('index.html'),
                    )
                }
            } else if (
                this.centre.webContents.getURL().includes('welcome.html')
            ) {
                this.centre.webContents.loadURL(resolveHtmlPath('index.html'))
            }
        }
        this.current = scene

        if (scene === Scenes.BROWSER) {
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

    private setEventListeners() {
        this.addListener('close', () => {
            this.saveStatus()
        })
    }

    /**
     * Save current status when the app is closed
     */
    private saveStatus() {
        const status = Status.getInstance()
        const bounds = this.getBounds()
        status.setNumber('width', bounds.width)
        status.setNumber('height', bounds.height)
        status.setNumber('x', bounds.x)
        status.setNumber('y', bounds.y)
        status.save()

        // Save history
        if (this.browser.webContents) {
            const history = new History()
            history.write(
                this.browser.webContents.navigationHistory.getActiveIndex(),
                this.browser.webContents.navigationHistory.getAllEntries(),
                status.getNumber('maxHistory'),
            )
        }

        // Save Popup Blocker
        PopupBlocker.getInstance().save()

        // Save Bookmark
        Bookmarks.getInstance().save()
        Anchors.getInstance().save()
    }
}
