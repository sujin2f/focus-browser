import {
    session,
    BrowserWindow as ElectronBrowserWindow,
    Menu,
    Notification,
    type MenuItemConstructorOptions,
    type BaseWindowConstructorOptions,
} from 'electron'

import { preload, resolveHtmlPath, message } from '@main/util'
import {
    Channel,
    RequestHandler,
    MenuCategory,
    Menu as E_Menu,
    SceneBrowser,
    PageType,
    type Scenes,
    type Bookmark,
    type MenuBlock,
    type Info,
} from '@src/types'

import History from '@main/modules/store/history'
import Status from '@main/modules/store/status'
import Bookmarks from '@main/modules/store/bookmarks'
import PopupBlocker from '@main/modules/store/popup'
import Anchors from '@main/modules/store/anchors'
import Shortcut from '@main/modules/store/shortcut'

import { BrowserView } from '@main/modules/scenes/browser'
import { CentreView } from '@main/modules/scenes/centre'
import Logger from '@main/modules/logger'

/**
 * All starts with here
 */
export class BrowserWindow extends ElectronBrowserWindow {
    protected browser: BrowserView
    protected centre: CentreView
    protected current: Scenes = SceneBrowser.BROWSER

    /**
     * Constants
     */
    constructor(options?: BaseWindowConstructorOptions) {
        super(options)

        /**
         * Menu
         */
        this.buildMenu()

        /**
         * IPC
         */
        message.on(Channel.INFO, this.onInfo.bind(this))
        message.on(Channel.SWITCH, this.onSwitch.bind(this))
        message.on(Channel.HISTORY, this.onHistory.bind(this))
        message.on(Channel.BOOKMARK, this.onBookmarks.bind(this))

        /**
         * Set views
         */
        this.browser = new BrowserView(
            {
                webPreferences: {
                    session: session.fromPartition('persist:my-partition'),
                    partition: 'persist:my-partition',
                },
            },
            this.switch.bind(this),
        )
        // #20 Web Title to App Title
        this.browser.webContents
            .on('page-title-updated', (e, title) => {
                this.title = title
            })
            .on('will-navigate', () => (this.title = 'Loading...'))

        this.contentView = this.browser

        /**
         * Restore status
         */
        const status = Status.getInstance()

        // Restore window size
        const bounds = status.getBounds(this.getBounds())
        this.setBounds(bounds)

        /**
         * Centre
         */
        this.centre = new CentreView({
            webPreferences: {
                preload,
            },
        })
        this.centre.webContents
            .loadURL(resolveHtmlPath('index.html'))
            .then(() => {
                this.centre.sendInfo(
                    this.browser.webContents.session.getCacheSize(),
                )
                if (status.get('welcome')) {
                    this.switch(PageType.WELCOME)
                    status.set('welcome', false)
                }
            })
            .catch((e) => Logger.getInstance().error(e))

        // Close action
        this.addListener('close', () => this.saveStatus())
    }

    /**
     * View controls
     */
    protected switch(scene: Scenes) {
        this.current = scene
        if (scene === SceneBrowser.BROWSER) {
            this.contentView = this.browser
            if (this.browser.failedUrl) {
                this.browser.reload()
            }
            return
        }

        this.contentView = this.centre
        this.centre.webContents.send(Channel.SWITCH, scene)
        this.centre.webContents.focus()
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
            // Remove duplication
            let prevUrl = ''
            const entries = [
                ...this.browser.webContents.navigationHistory.getAllEntries(),
            ].filter((item) => {
                if (item.url !== prevUrl) {
                    prevUrl = item.url
                    return true
                }

                return false
            })

            // Find current index
            let index = 0
            const indexed =
                this.browser.webContents.navigationHistory.getAllEntries()[
                    this.browser.webContents.navigationHistory.getActiveIndex()
                ].url
            for (let [i, item] of entries.entries()) {
                if (item.url === indexed) {
                    index = i
                    break
                }
            }

            new History().write(index, entries, status.getNumber('maxHistory'))
        }

        // Save Popup Blocker
        PopupBlocker.getInstance().save()

        // Save Bookmark
        Bookmarks.getInstance().save()
        Anchors.getInstance().save()
    }

    /**
     * Menu
     */
    private buildMenu() {
        const data = this.addMenuCallbacks(
            Shortcut.getInstance().get('menu') as MenuBlock,
        )

        const menu: MenuItemConstructorOptions[] = []

        Object.keys(data).forEach((key) => {
            const submenu: MenuItemConstructorOptions[] = []
            Object.keys(data[key as MenuCategory]).forEach((subKey) => {
                if (subKey.startsWith('s0')) {
                    submenu.push({ type: 'separator' })
                    return
                }
                submenu.push({
                    label: subKey,
                    ...data[key as MenuCategory][subKey as E_Menu],
                } as MenuItemConstructorOptions)
            })
            menu.push({
                label: key,
                submenu: submenu,
            })
        })

        const built = Menu.buildFromTemplate(menu)
        Menu.setApplicationMenu(built)
    }

    private addMenuCallbacks(menu: MenuBlock) {
        menu[MenuCategory.EDIT][E_Menu.ADD_BOOKMARK].click = () => {
            if (this.current === SceneBrowser.BROWSER) {
                const added = Bookmarks.getInstance().push({
                    url: this.browser.webContents.getURL(),
                    title: this.browser.webContents.getTitle(),
                })
                if (!added) {
                    return
                }
                this.showBookmarkNotification()
            }
        }

        menu[MenuCategory.EDIT][E_Menu.ADD_ANCHOR].click = () => {
            if (this.current === SceneBrowser.BROWSER) {
                const added = Anchors.getInstance().push({
                    url: this.browser.webContents.getURL(),
                    title: this.browser.webContents.getTitle(),
                })

                if (!added) {
                    return
                }

                const notification = new Notification({
                    title: 'Focus',
                    body: 'New Anchor Added',
                    silent: true,
                })
                notification.addListener('click', () => {
                    this.switch(PageType.ANCHOR)
                })
                notification.show()
            }
        }

        menu[MenuCategory.VIEW][E_Menu.FULL_SCREEN].click = () => {
            this.setFullScreen(!this.fullScreen)
        }

        menu[MenuCategory.VIEW][E_Menu.DEVTOOLS].click = () => {
            if (
                this.browser.webContents.isDevToolsOpened() ||
                this.centre.webContents.isDevToolsOpened()
            ) {
                this.browser.webContents.closeDevTools()
                this.centre.webContents.closeDevTools()
                return
            }

            if (this.current === SceneBrowser.BROWSER) {
                this.browser.webContents.openDevTools()
                this.centre.webContents.closeDevTools()
                return
            }
            this.browser.webContents.closeDevTools()
            this.centre.webContents.openDevTools()
        }

        menu[MenuCategory.NAVIGATE][E_Menu.ADDRESS].click = () => {
            this.switch(PageType.ADDRESS)
        }

        menu[MenuCategory.NAVIGATE][E_Menu.CENTRE].click = () => {
            this.switch(PageType.HOME)
        }

        menu[MenuCategory.NAVIGATE][E_Menu.BACK].click = () => {
            if (
                this.current === SceneBrowser.BROWSER &&
                this.browser.webContents.navigationHistory.canGoBack()
            ) {
                this.browser.webContents.navigationHistory.goBack()
            }
        }

        menu[MenuCategory.NAVIGATE][E_Menu.FORWARD].click = () => {
            if (
                this.current === SceneBrowser.BROWSER &&
                this.browser.webContents.navigationHistory.canGoForward()
            ) {
                this.browser.webContents.navigationHistory.goForward()
            }
        }

        menu[MenuCategory.NAVIGATE][E_Menu.RELOAD].click = () => {
            if (this.current === SceneBrowser.BROWSER) {
                this.browser.reload()
            }
        }

        menu[MenuCategory.NAVIGATE][E_Menu.STOP].click = () => {
            if (this.current === SceneBrowser.BROWSER) {
                this.browser.webContents.stop()
            }
        }

        return menu
    }

    /**
     * IPC
     */
    private onInfo(handler: RequestHandler, data: Partial<Info>) {
        if (handler === RequestHandler.MODIFY) {
            Status.getInstance().merge(data)
            return
        }

        if (handler === RequestHandler.REQUEST) {
            if (data) {
                this.centre.sendLocation(
                    this.browser.webContents.getTitle(),
                    this.browser.webContents.getURL(),
                )
                return
            }
            this.centre.sendInfo(
                this.browser.webContents.session.getCacheSize(),
            )
        }
    }

    private onSwitch(
        scene: Scenes,
        address?: string,
        handler?: RequestHandler,
    ) {
        this.switch(scene)

        if (scene === SceneBrowser.BROWSER && address) {
            if (address === 'reload') {
                this.browser.reload()
                return
            }
            this.browser.loadURL(address)
        }

        if (handler === RequestHandler.REMOVE) {
            Anchors.getInstance().remove(address)
        }
    }

    private onHistory(handler: RequestHandler, index: number) {
        switch (handler) {
            case RequestHandler.REQUEST:
                this.centre.sendHistory(
                    this.browser.webContents.navigationHistory.getAllEntries(),
                )
                return

            case RequestHandler.EXECUTE:
                this.switch(SceneBrowser.BROWSER)
                this.browser.webContents.navigationHistory.goToIndex(index)
                return

            case RequestHandler.REMOVE:
                this.browser.webContents.navigationHistory.clear()
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
                this.centre.sendBookmarks()
                return
            case RequestHandler.ADD:
                const added = Bookmarks.getInstance().push(bookmark)
                if (!added) {
                    return
                }
                this.showBookmarkNotification()
                return
            case RequestHandler.MODIFY:
                Bookmarks.getInstance().edit(index, bookmark)
                return
            case RequestHandler.REMOVE:
                Bookmarks.getInstance().remove(bookmark as unknown as number)
                return
        }
    }

    private showBookmarkNotification() {
        const notification = new Notification({
            title: 'Focus',
            body: 'New Bookmark Added',
            silent: true,
        })
        notification.addListener('click', () => {
            this.switch(PageType.BOOKMARK)
        })
        notification.show()
    }

    show() {
        if (this.current === SceneBrowser.BROWSER) {
            this.browser.webContents.focus()
        } else {
            this.centre.webContents.focus()
        }
        super.show()
    }
}
