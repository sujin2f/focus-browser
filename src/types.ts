import type { MenuItemConstructorOptions } from 'electron'

/**
 * stores in status.json
 */
export type StatusProps = {
    width: number
    height: number
    x: number
    y: number
    maxHistory: number
    welcome: boolean
    helpText: boolean
    adBlocker: boolean
}

/**
 * for IPC comm.
 */
export type Info = Partial<
    StatusProps & {
        shortcuts: Shortcuts
        cache: number
        title: string
        url: string
        adBlockerStatus: boolean | null
    }
>

export type Bookmark = {
    url: string
    title: string
    shortcut?: string
}

export type PopupBlocker = {
    host: string
    allowed?: boolean
}

/**
 * Control centre pages
 */
export enum PageType {
    WELCOME,
    HOME,
    ADDRESS,
    BOOKMARK,
    HISTORY,
    ANCHOR,
    POPUP_BLOCKER,
    SETTING,
    OFFLINE,
}

export enum SceneBrowser {
    BROWSER,
}

export type Scenes = PageType | SceneBrowser

export enum Channel {
    INFO = 'INFO',
    SWITCH = 'SWITCH',
    BOOKMARK = 'BOOKMARK',
    HISTORY = 'HISTORY',
    ANCHOR = 'ANCHOR',
    POPUP_BLOCKER = 'POPUP_BLOCKER',
}

export enum RequestHandler {
    REQUEST = 'REQUEST',
    RESPONSE = 'RESPONSE',
    ADD = 'ADD',
    MODIFY = 'MODIFY',
    REMOVE = 'REMOVE',
    EXECUTE = 'EXECUTE',
}

export enum PageMode {
    LIST,
    NEW,
    EDIT,
    FIND,
}

export enum TableAction {
    EDIT,
    UPDATE,
    BLUR,
    DELETE,
    EXECUTE,
    INFO,
}

type MenuItems = Partial<Record<Menu, MenuItemConstructorOptions>>
export type Shortcuts = Record<string, Menu>
export type MenuBlock = Partial<Record<MenuCategory, MenuItems>>
export type ShortcutStore = {
    menu: MenuBlock
    shortcuts: Shortcuts
}

export enum SystemType {
    DARWIN = 'darwin',
    DEFAULT = 'default',
}

export enum MenuCategory {
    FOCUS = 'Focus',
    FILE = 'FILE',
    EDIT = 'Edit',
    VIEW = 'View',
    NAVIGATE = 'Navigate',
    WINDOW = 'Window',
}

export enum Menu {
    ABOUT = 'About Focus',
    HIDE = 'Hide Focus',
    HIDE_OTHERS = 'Hide Others',
    SHOW_ALL = 'Show All',
    QUIT = 'Quit',
    UNDO = 'Undo',
    REDO = 'Redo',
    CUT = 'Cut',
    COPY = 'Copy',
    PASTE = 'Paste',
    SELECT_ALL = 'Select All',
    ADD_BOOKMARK = 'Add Bookmark',
    ADD_ANCHOR = 'Add Anchor',
    FULL_SCREEN = 'Toggle Full Screen',
    RESET_ZOOM = 'Reset Zoom',
    ZOOM_IN = 'Zoom In',
    ZOOM_OUT = 'Zoom Out',
    DEVTOOLS = 'Toggle Developer Tools',
    ADDRESS = 'Address Bar',
    CENTRE = 'Control Centre',
    BACK = 'Back',
    FORWARD = 'Forward',
    STOP = 'Stop',
    RELOAD = 'Reload',
    MINIMIZE = 'Minimize',
    CLOSE = 'Close',
    BRING_TO_FRONT = 'Bring to Front',
    s0001 = 's0001',
    s0002 = 's0002',
    s0003 = 's0003',
}

export type ElementProps = {
    className: string[]
    hide: boolean
    onClick: (ev: HTMLElementEventMap['click']) => any
}
