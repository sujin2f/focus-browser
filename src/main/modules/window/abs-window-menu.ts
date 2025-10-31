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
} from 'electron'
import { Logger } from '@main/modules/logger'

import {
    MenuCategory,
    Menu as EnumMenu,
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
 * Base BrowserWindow subclass responsible for wiring the application menu
 * and constructing context menus that operate on the embedded BrowserView(s).
 *
 * Responsibilities:
 * - Build application menu from saved shortcut/menu configuration
 * - Map menu items to window/browser actions (navigation, devtools, bookmarks)
 * - Provide context menu entries for images/links and basic edit actions
 * - Helpers to add bookmarks/anchors and copy images to clipboard
 *
 * Concrete windows should extend this class and implement `switch(scene)`.
 */
export abstract class AbsWindowMenu extends ElectronBrowserWindow {
    protected browser: BrowserView
    protected centre: WebContentsView
    protected _current: Scenes = SceneBrowser.BROWSER
    protected get isBrowser() {
        return this._current === SceneBrowser.BROWSER
    }
    // Returns the current WebContentsView
    protected get current() {
        return this.isBrowser ? this.browser : this.centre
    }

    /**
     * Constructor
     *
     * Builds the application menu from the persisted Shortcut.store 'menu' block.
     * Each menu entry in the template is wired to callbacks set in addMenuCallbacks.
     */
    constructor(options?: BaseWindowConstructorOptions) {
        super(options)

        // Retrieve persisted menu config and attach callbacks for actions
        const data = this.addMenuCallbacks(
            Shortcut.getInstance().get('menu') as MenuBlock,
        )

        const menu: MenuItemConstructorOptions[] = []

        // Convert stored MenuBlock into Electron MenuItemConstructorOptions[]
        Object.keys(data).forEach((key) => {
            const submenu: MenuItemConstructorOptions[] = []
            Object.keys(data[key as MenuCategory]).forEach((subKey) => {
                // s0* keys represent separators in the stored config
                if (subKey.startsWith('s0')) {
                    submenu.push({ type: 'separator' })
                    return
                }

                submenu.push({
                    label: subKey,
                    ...data[key as MenuCategory][subKey as EnumMenu],
                } satisfies MenuItemConstructorOptions)
            })
            menu.push({
                label: key,
                submenu: submenu,
            })
        })

        // Build and set the global application menu
        const built = Menu.buildFromTemplate(menu)
        Menu.setApplicationMenu(built)
    }

    /**
     * Attach runtime callbacks to the loaded MenuBlock so menu actions
     * trigger window-specific behavior (add bookmark, navigate, toggle devtools, etc).
     */
    private addMenuCallbacks(menu: MenuBlock) {
        menu[MenuCategory.EDIT][EnumMenu.ADD_BOOKMARK].click = () => {
            if (this.isBrowser) {
                this.addBookmark()
            }
        }

        menu[MenuCategory.EDIT][EnumMenu.ADD_ANCHOR].click = () => {
            if (this.isBrowser) {
                this.addAnchor()
            }
        }

        menu[MenuCategory.VIEW][EnumMenu.FULL_SCREEN].click = () => {
            this.setFullScreen(!this.fullScreen)
        }

        menu[MenuCategory.VIEW][EnumMenu.DEVTOOLS].click = () => {
            this.current.webContents.toggleDevTools()
        }

        menu[MenuCategory.NAVIGATE][EnumMenu.ADDRESS].click = () => {
            this.switch(PageType.ADDRESS)
        }

        menu[MenuCategory.NAVIGATE][EnumMenu.CENTRE].click = () => {
            this.switch(PageType.HOME)
        }

        menu[MenuCategory.NAVIGATE][EnumMenu.BACK].click = () => {
            this.current.webContents.navigationHistory.goBack()
        }

        menu[MenuCategory.NAVIGATE][EnumMenu.FORWARD].click = () => {
            this.current.webContents.navigationHistory.goForward()
        }

        menu[MenuCategory.NAVIGATE][EnumMenu.RELOAD].click = () => {
            this.reload()
        }

        menu[MenuCategory.NAVIGATE][EnumMenu.STOP].click = () => {
            this.current.webContents.stop()
        }

        return menu
    }

    /**
     * Compose a context menu based on provided ContextMenuParams from Electron.
     *
     * @param {ContextMenuParams} params Comes from webContents.on('context-menu')
     * @returns {MenuItemConstructorOptions[]}
     */
    public getContextMenu(
        params: ContextMenuParams,
    ): MenuItemConstructorOptions[] {
        const menu: MenuItemConstructorOptions[] = [
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
                click: () => this.reload(),
            },
        ]

        // If the clicked element has image contents, prepend image actions
        if (params.hasImageContents) {
            return [
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
            ]
        }

        // If the clicked element is a link, provide a copy-link entry
        if (params.linkURL) {
            return [
                {
                    label: 'Copy Link URL',
                    click: () => clipboard.writeText(params.linkURL),
                },
                { type: 'separator' },
                ...menu,
            ]
        }

        // Default context menu
        return menu
    }

    /**
     * Persist a bookmark using the Bookmarks store and show a Notification
     * only when the push succeeds. Notification click switches to bookmark page.
     */
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
        // Clicking the notification navigates to the bookmark page
        notification.addListener('click', () => {
            this.switch(PageType.BOOKMARK)
        })
        notification.show()
    }

    /**
     * Persist an anchor (user-saved position) and notify. Mirrors addBookmark
     * behavior but switches to the Anchor page on notification click.
     */
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
        // Clicking the notification navigates to the anchor page
        notification.addListener('click', () => {
            this.switch(PageType.ANCHOR)
        })
        notification.show()
    }

    /**
     * Fetch an image by URL, convert to a Buffer, create an Electron nativeImage
     * and write it to the system clipboard. Errors are logged via Logger.
     *
     * TODO: this method performs network I/O and uses Buffer/nativeImage.
     * Tests should mock fetch, nativeImage.createFromBuffer, and clipboard.
     *
     * @param {string} imageUrl
     */
    private async copyImageToClipboard(imageUrl: string) {
        try {
            await fetch(imageUrl).then(async (response) => {
                const blob = await (await response.blob()).arrayBuffer()
                const buffer = Buffer.from(blob)
                const image = nativeImage.createFromBuffer(buffer)
                clipboard.writeImage(image)
            })
        } catch (e) {
            // Log fetch/processing errors for diagnostics
            Logger.getInstance().error(
                'Error fetching or processing image:',
                JSON.stringify(e),
            )
        }
    }

    abstract switch(scene: Scenes): void
}
