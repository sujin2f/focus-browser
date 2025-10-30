import {
    BrowserWindow as ElectronBrowserWindow,
    WebContentsView,
    Menu,
    Notification,
    clipboard,
    nativeImage,
    type MenuItemConstructorOptions,
    type BaseWindowConstructorOptions,
    type ContextMenuParams,
    type MenuItem,
} from 'electron'
import Logger from '@main/modules/logger'

import {
    MenuCategory,
    Menu as E_Menu,
    SceneBrowser,
    PageType,
    type Scenes,
    type MenuBlock,
} from '@src/types'

import Shortcut from '@main/modules/store/shortcut'
import Bookmarks from '@main/modules/store/bookmarks'
import Anchors from '@main/modules/store/anchors'

import { BrowserView } from '@src/main/modules/view/browser'

/**
 * All starts with here
 */
export abstract class AbsWindowMenu extends ElectronBrowserWindow {
    protected browser: BrowserView
    protected centre: WebContentsView
    protected current: Scenes = SceneBrowser.BROWSER

    /**
     * Constants
     */
    constructor(options?: BaseWindowConstructorOptions) {
        super(options)

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
                this.addBookmark()
            }
        }

        menu[MenuCategory.EDIT][E_Menu.ADD_ANCHOR].click = () => {
            if (this.current === SceneBrowser.BROWSER) {
                this.addAnchor()
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
            if (this.current === SceneBrowser.BROWSER) {
                this.browser.webContents.navigationHistory.goBack()
            }
        }

        menu[MenuCategory.NAVIGATE][E_Menu.FORWARD].click = () => {
            if (this.current === SceneBrowser.BROWSER) {
                this.browser.webContents.navigationHistory.goForward()
            }
        }

        menu[MenuCategory.NAVIGATE][E_Menu.RELOAD].click = () => {
            this.reloadBrowser()
        }

        menu[MenuCategory.NAVIGATE][E_Menu.STOP].click = () => {
            if (this.current === SceneBrowser.BROWSER) {
                this.browser.webContents.stop()
            }
        }

        return menu
    }

    protected async showContextMenu(_: unknown, params: ContextMenuParams) {
        const menu: Array<MenuItemConstructorOptions | MenuItem> = [
            (() =>
                params.editFlags.canCut
                    ? {
                          label: 'Cut',
                          role: 'cut',
                      }
                    : {
                          label: 'Cut',
                          enabled: false,
                      })(),
            (() =>
                params.editFlags.canCopy
                    ? {
                          label: 'Copy',
                          role: 'copy',
                      }
                    : {
                          label: 'Copy',
                          enabled: false,
                      })(),
            (() =>
                params.editFlags.canPaste
                    ? {
                          label: 'Paste',
                          role: 'paste',
                      }
                    : {
                          label: 'Paste',
                          enabled: false,
                      })(),
            { type: 'separator' },
            {
                label: 'Add Bookmark',
                click: () => this.addBookmark(),
            },
            {
                label: 'Add Anchor',
                click: () => this.addAnchor(),
            },
            {
                label: 'Control Centre',
                click: () => this.switch(PageType.HOME),
            },
            { type: 'separator' },
            {
                label: 'Back',
                click: () =>
                    this.browser.webContents.navigationHistory.goBack(),
                enabled: this.browser.webContents.navigationHistory.canGoBack(),
            },
            {
                label: 'Forward',
                click: () =>
                    this.browser.webContents.navigationHistory.goForward(),
                enabled:
                    this.browser.webContents.navigationHistory.canGoForward(),
            },
            {
                label: 'Reload',
                click: () => this.reloadBrowser(),
            },
        ]

        // only show the context menu if the element is editable
        if (params.hasImageContents) {
            Menu.buildFromTemplate([
                {
                    label: 'Copy Image',
                    click: () => this.copyImageToClipboard(params.srcURL),
                },
                {
                    label: 'Copy Image Address',
                    click: () => clipboard.writeText(params.srcURL),
                },
                { type: 'separator' },
                ...menu,
            ]).popup()
            return
        }

        if (params.linkURL) {
            Menu.buildFromTemplate([
                {
                    label: 'Copy Link URL',
                    click: () => clipboard.writeText(params.linkURL),
                },
                { type: 'separator' },
                ...menu,
            ]).popup()
            return
        }

        Menu.buildFromTemplate([...menu]).popup()
    }

    private reloadBrowser() {
        if (this.current !== SceneBrowser.BROWSER) {
            return
        }
        this.title = 'Reloading...'
        this.browser.webContents.reload()
    }

    private addBookmark() {
        const added = Bookmarks.getInstance().push({
            url: this.browser.webContents.getURL(),
            title: this.browser.webContents.getTitle(),
        })
        if (!added) {
            return
        }

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

    private addAnchor() {
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

    private async copyImageToClipboard(imageUrl: string) {
        try {
            await fetch(imageUrl).then(async (response) => {
                const blob = await (await response.blob()).arrayBuffer()
                const buffer = Buffer.from(blob)
                const image = nativeImage.createFromBuffer(buffer)
                clipboard.writeImage(image)
            })
        } catch (error) {
            Logger.getInstance().error(
                'Error fetching or processing image:',
                error,
            )
        }
    }

    abstract switch(scene: Scenes): void
}
