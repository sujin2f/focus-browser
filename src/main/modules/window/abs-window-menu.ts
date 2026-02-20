import {
    BrowserWindow as ElectronBrowserWindow,
    Menu as ElectronMenu,
    Notification,
    clipboard,
    type MenuItemConstructorOptions,
    type BaseWindowConstructorOptions,
    type ContextMenuParams,
} from 'electron'

import type {
    Scenes,
    MenuBlock,
    MenuItems,
    T_IPC_Switch,
} from '@src/common/types'
import {
    MenuCategory,
    Menu,
    CENTRE_PAGES,
    BROWSER,
    SystemType,
    DEFAULT_SHORTCUTS,
    EMOJI,
} from '@src/common/constants'

import { Bookmarks } from '@main/modules/store/bookmarks'
import { Anchors } from '@main/modules/store/anchors'
import { Shortcut } from '@main/modules/store/shortcut'

import { BrowserView } from '@src/main/modules/view/browser'
import { CenterView } from '@src/main/modules/view/centre'
import { Logger } from '@src/common/logger'
import { isBeta, isDev, isTest } from '@src/common/utils'

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
    protected browser!: BrowserView
    protected centre!: CenterView
    protected _current: Scenes = CENTRE_PAGES.WELCOME
    protected get isBrowser() {
        return this._current === BROWSER
    }
    // Returns the current WebContentsView
    protected get current() {
        return this.isBrowser ? this.browser : this.centre
    }
    protected findText = ''

    private get menuItems(): MenuBlock {
        const view: MenuItems = {
            [Menu.FULL_SCREEN]: {
                accelerator: this.getShortcut(Menu.FULL_SCREEN),
                click: () => {
                    this.setFullScreen(!this.fullScreen)
                },
            },
            [Menu.FIT_TO_SCREEN]: {
                accelerator: this.getShortcut(Menu.FIT_TO_SCREEN),
                click: () => {
                    this.toggleMaximize()
                },
            },
            [Menu.s0001]: {},
            [Menu.RESET_ZOOM]: {
                accelerator: this.getShortcut(Menu.RESET_ZOOM),
                role: 'resetZoom',
            },
            [Menu.ZOOM_IN]: {
                accelerator: this.getShortcut(Menu.ZOOM_IN),
                role: 'zoomIn',
            },
            [Menu.ZOOM_OUT]: {
                accelerator: this.getShortcut(Menu.ZOOM_OUT),
                role: 'zoomOut',
            },
            [Menu.s0002]: {},
            [Menu.DEVTOOLS]: {
                accelerator: this.getShortcut(Menu.DEVTOOLS),
                click: () => {
                    this.current.webContents.toggleDevTools()
                },
            },
        }
        const edit: MenuItems = {
            [Menu.UNDO]: {
                accelerator: this.getShortcut(Menu.UNDO),
                role: 'undo',
            },
            [Menu.REDO]: {
                accelerator: this.getShortcut(Menu.REDO),
                role: 'redo',
            },
            [Menu.s0001]: {},
            [Menu.CUT]: {
                accelerator: this.getShortcut(Menu.CUT),
                role: 'cut',
            },
            [Menu.COPY]: {
                accelerator: this.getShortcut(Menu.COPY),
                role: 'copy',
            },
            [Menu.PASTE]: {
                accelerator: this.getShortcut(Menu.PASTE),
                role: 'paste',
            },
            [Menu.PASTE_KEYSTROKE]: {
                accelerator: this.getShortcut(Menu.PASTE_KEYSTROKE),
                click: () => {
                    if (this.isBrowser) {
                        this.browser.pasteKeystrokes()
                    }
                },
            },
            [Menu.SELECT_ALL]: {
                accelerator: this.getShortcut(Menu.SELECT_ALL),
                role: 'selectAll',
            },
            [Menu.s0002]: {},
            [Menu.FIND]: {
                accelerator: this.getShortcut(Menu.FIND),
                click: () => {
                    // TODO Find to child view #121
                    // const view = new WebContentsView()
                    // view.webContents.loadURL(...)
                    // this.contentView.addChildView(view)
                    // view.setBounds({ x: 400, y: 0, width: 400, height: 400 })
                    // view.setVisible(true)
                    // this.contentView.removeChildView(view)
                    this.switch({ scene: CENTRE_PAGES.FIND })
                },
            },
            [Menu.FIND_NEXT]: {
                accelerator: this.getShortcut(Menu.FIND_NEXT),
                click: () => {
                    if (!this.findText) {
                        return
                    }
                    this.browser.webContents.findInPage(this.findText, {
                        findNext: true,
                    })
                },
            },
            [Menu.FIND_PREV]: {
                accelerator: this.getShortcut(Menu.FIND_PREV),
                click: () => {
                    if (!this.findText) {
                        return
                    }
                    this.browser.webContents.findInPage(this.findText, {
                        forward: false,
                        findNext: true,
                    })
                },
            },
            [Menu.STOP]: {
                accelerator: this.getShortcut(Menu.STOP),
                click: () => {
                    this.browser.webContents.stopFindInPage('clearSelection')
                },
            },
            [Menu.s0003]: {},
            [Menu.ADD_BOOKMARK]: {
                accelerator: this.getShortcut(Menu.ADD_BOOKMARK),
                click: () => {
                    if (this.isBrowser) {
                        this.addBookmark()
                    }
                },
            },
            [Menu.ADD_ANCHOR]: {
                accelerator: this.getShortcut(Menu.ADD_ANCHOR),
                click: () => {
                    if (this.isBrowser) {
                        this.addAnchor()
                    }
                },
            },
        }
        const navigate: MenuItems = {
            [Menu.ADDRESS]: {
                accelerator: this.getShortcut(Menu.ADDRESS),
                click: () => {
                    this.switch({ scene: CENTRE_PAGES.ADDRESS })
                },
            },
            [Menu.CENTRE]: {
                accelerator: this.getShortcut(Menu.CENTRE),
                click: () => {
                    this.switch({ scene: CENTRE_PAGES.HOME })
                },
            },
            [Menu.s0001]: {},
            [Menu.BACK]: {
                accelerator: this.getShortcut(Menu.BACK),
                click: () => {
                    this.current.webContents.navigationHistory.goBack()
                },
            },
            [Menu.BACK_HIDDEN]: {
                accelerator: this.getShortcut(Menu.BACK_HIDDEN),
                visible: false,
                acceleratorWorksWhenHidden: true,
                click: async () => {
                    await this.browser.webContents
                        .executeJavaScript('document.activeElement.tagName')
                        .then((tagName: string) => {
                            if (
                                tagName.toLowerCase() !== 'input' &&
                                tagName.toLowerCase() !== 'textarea'
                            ) {
                                this.current.webContents.navigationHistory.goBack()
                            }
                        })
                        .catch((e) => {
                            Logger.getInstance().error(
                                `Menu.BACK_HIDDEN failed get tagName ${JSON.stringify(e)}`,
                            )
                        })
                },
            },
            [Menu.FORWARD]: {
                accelerator: this.getShortcut(Menu.FORWARD),
                click: () => {
                    this.current.webContents.navigationHistory.goForward()
                },
            },
            [Menu.FORWARD_HIDDEN]: {
                accelerator: this.getShortcut(Menu.FORWARD_HIDDEN),
                visible: false,
                acceleratorWorksWhenHidden: true,
                click: async () => {
                    await this.browser.webContents
                        .executeJavaScript('document.activeElement.tagName')
                        .then((tagName: string) => {
                            if (
                                tagName.toLowerCase() !== 'input' &&
                                tagName.toLowerCase() !== 'textarea'
                            ) {
                                this.current.webContents.navigationHistory.goForward()
                            }
                        })
                        .catch((e) => {
                            Logger.getInstance().error(
                                `Menu.FORWARD_HIDDEN failed get tagName ${JSON.stringify(e)}`,
                            )
                        })
                },
            },
            [Menu.s0002]: {},
            [Menu.STOP]: {
                accelerator: this.getShortcut(Menu.STOP),
                click: () => {
                    this.current.webContents.stop()
                },
            },
            [Menu.RELOAD]: {
                accelerator: this.getShortcut(Menu.RELOAD),
                click: () => {
                    this.reload()
                },
            },
        }

        const result: MenuBlock =
            process.platform === 'darwin'
                ? {
                      [MenuCategory.FOCUS]: {
                          [Menu.ABOUT]: {
                              role: 'about',
                          },
                          [Menu.s0001]: {},
                          [Menu.HIDE]: {
                              accelerator: this.getShortcut(Menu.HIDE),
                              role: 'hide',
                          },
                          [Menu.HIDE_OTHERS]: {
                              accelerator: this.getShortcut(Menu.HIDE_OTHERS),
                              role: 'hideOthers',
                          },
                          [Menu.SHOW_ALL]: {
                              role: 'unhide',
                          },
                          [Menu.s0002]: {},
                          [Menu.QUIT]: {
                              accelerator: this.getShortcut(Menu.QUIT),
                              role: 'quit',
                          },
                      },
                      [MenuCategory.EDIT]: edit,
                      [MenuCategory.VIEW]: view,
                      [MenuCategory.NAVIGATE]: navigate,
                      [MenuCategory.WINDOW]: {
                          [Menu.MINIMIZE]: {
                              accelerator: this.getShortcut(Menu.MINIMIZE),
                              role: 'minimize',
                          },
                          [Menu.CLOSE]: {
                              accelerator: this.getShortcut(Menu.CLOSE),
                              role: 'close',
                          },
                          [Menu.s0001]: {},
                          [Menu.BRING_TO_FRONT]: {
                              role: 'front',
                          },
                      },
                  }
                : {
                      [MenuCategory.FILE]: {
                          [Menu.QUIT]: {
                              accelerator: this.getShortcut(Menu.QUIT),
                              role: 'quit',
                          },
                      },
                      [MenuCategory.EDIT]: edit,
                      [MenuCategory.VIEW]: view,
                      [MenuCategory.NAVIGATE]: navigate,
                  }

        if (isDev() || (isBeta() && !isTest())) {
            if (result[MenuCategory.EDIT]) {
                result[MenuCategory.EDIT][Menu.TEST] = {
                    label: 'Run Test Block',
                    accelerator: 'CommandOrControl+T',
                    click: this.runTest.bind(this),
                }
            }
        }

        return result
    }

    private getShortcut(menu: Menu): string {
        const store = new Shortcut()
        if (store.getShortcut(menu)) {
            return store.getShortcut(menu)
        }

        const system =
            process.platform === 'darwin'
                ? SystemType.DARWIN
                : SystemType.DEFAULT
        return DEFAULT_SHORTCUTS[menu][system]
    }

    /**
     * Constructor
     *
     * Builds the application menu from the persisted Shortcut.store 'menu' block.
     * Each menu entry in the template is wired to callbacks set in addMenuCallbacks.
     */
    constructor(options?: BaseWindowConstructorOptions) {
        super(options)
        this.resetMenu()
    }

    protected resetMenu() {
        // Retrieve persisted menu config and attach callbacks for actions
        const data = this.menuItems

        const menu: MenuItemConstructorOptions[] = []

        // Convert stored MenuBlock into Electron MenuItemConstructorOptions[]
        Object.entries(data).forEach(([key, value]) => {
            const submenu: MenuItemConstructorOptions[] = []
            Object.keys(value).forEach((subKey) => {
                // s0* keys represent separators in the stored config
                if (subKey.startsWith('s0')) {
                    submenu.push({ type: 'separator' })
                    return
                }
                const label = `${EMOJI[subKey] ? `${EMOJI[subKey]} ` : ''}${subKey}`
                submenu.push({
                    label,
                    ...value[subKey as keyof typeof value],
                } satisfies MenuItemConstructorOptions)
            })
            menu.push({
                label: key,
                submenu: submenu,
            })
        })

        // Build and set the global application menu
        const built = ElectronMenu.buildFromTemplate(menu)
        ElectronMenu.setApplicationMenu(built)
    }

    protected toggleMaximize() {
        if (this.isMaximized()) {
            this.unmaximize()
            return
        }
        this.maximize()
    }

    /**
     * Compose a context menu based on provided ContextMenuParams from Electron.
     *
     * @param {ContextMenuParams} params Comes from webContents.on('context-menu')
     */
    public showContextMenu(params: ContextMenuParams) {
        let menu: MenuItemConstructorOptions[] = [
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
                click: () => this.switch({ scene: CENTRE_PAGES.HOME }),
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
            { type: 'separator' },
            {
                label: 'Inspect Element',
                click: () =>
                    this.browser.webContents.inspectElement(params.x, params.y),
            },
        ]

        // If the clicked element has image contents, prepend image actions
        if (params.hasImageContents) {
            menu = [
                {
                    label: 'Copy Image',
                    click: () =>
                        this.browser.webContents.copyImageAt(
                            params.x,
                            params.y,
                        ),
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
            menu = [
                {
                    label: 'Copy Link URL',
                    click: () => clipboard.writeText(params.linkURL),
                },
                { type: 'separator' },
                ...menu,
            ]
        }

        ElectronMenu.buildFromTemplate(menu).popup({
            x: params.x,
            y: params.y,
        })
    }

    /**
     * Persist a bookmark using the Bookmarks store and show a Notification
     * only when the push succeeds. Notification click switches to bookmark page.
     */
    private addBookmark() {
        Logger.getInstance().log('addBookmark')
        const bookmarks = new Bookmarks()
        const added = bookmarks.push({
            id: '',
            url: this.browser.webContents.getURL(),
            title: this.browser.webContents.getTitle(),
        })
        bookmarks.save()
        Logger.getInstance().log('addBookmark', added)

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
            this.switch({ scene: CENTRE_PAGES.BOOKMARK })
        })
        notification.show()
        Logger.getInstance().log('addBookmark >> notification should be shown.')
    }

    /**
     * Persist an anchor (user-saved position) and notify. Mirrors addBookmark
     * behavior but switches to the Anchor page on notification click.
     */
    private addAnchor() {
        const anchors = new Anchors()
        const added = anchors.push({
            id: '',
            url: this.browser.webContents.getURL(),
            title: this.browser.webContents.getTitle(),
        })
        anchors.save()

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
            this.switch({ scene: CENTRE_PAGES.ANCHOR })
        })
        notification.show()
    }

    private async runTest() {
        Logger.getInstance().log(`TEST RUN`)
        const windowFocus = this.webContents.isFocused()
        const browserFocus = this.browser.webContents.isFocused()
        Logger.getInstance().info(`windowFocus`, windowFocus)
        Logger.getInstance().info(`browserFocus`, browserFocus)
    }

    abstract switch(request: T_IPC_Switch): void
}
