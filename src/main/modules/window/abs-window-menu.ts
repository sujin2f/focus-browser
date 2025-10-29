import {
    BrowserWindow as ElectronBrowserWindow,
    Menu,
    Notification,
    type MenuItemConstructorOptions,
    type BaseWindowConstructorOptions,
} from 'electron'

import {
    MenuCategory,
    Menu as E_Menu,
    SceneBrowser,
    PageType,
    type Scenes,
    type MenuBlock,
} from '@src/types'

import Bookmarks from '@main/modules/store/bookmarks'
import Anchors from '@main/modules/store/anchors'
import Shortcut from '@main/modules/store/shortcut'

import { BrowserView } from '@src/main/modules/view/browser'
import { CentreView } from '@src/main/modules/view/centre'

/**
 * All starts with here
 */
export abstract class AbsWindowMenu extends ElectronBrowserWindow {
    protected browser: BrowserView
    protected centre: CentreView
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
                this.browser.addBookmark()
            }
        }

        menu[MenuCategory.EDIT][E_Menu.ADD_ANCHOR].click = () => {
            if (this.current === SceneBrowser.BROWSER) {
                this.browser.addAnchor()
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
            if (this.current === SceneBrowser.BROWSER) {
                this.title = 'Reloading...'
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

    abstract switch(scene: Scenes): void
}
