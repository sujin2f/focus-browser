import type { StatusProps } from '@src/common/types'

export const MAX_HISTORY = 200
export const CURRENT_PAGE_INFO = 'current-page-info'

/**
 * Control centre pages
 */
export enum PageType {
    RELOAD,
    WELCOME,
    HOME,
    ADDRESS,
    BOOKMARK,
    HISTORY,
    ANCHOR,
    POPUP_BLOCKER,
    SETTING,
    OFFLINE,
    FIND,
}

export const BROWSER = 'scene-browser'

export enum Channel {
    INFO = 'INFO',
    SWITCH = 'SWITCH',
    BOOKMARK = 'BOOKMARK',
    HISTORY = 'HISTORY',
    ANCHOR = 'ANCHOR',
    POPUP_BLOCKER = 'POPUP_BLOCKER',
    FIND = 'FIND',
    LOG = 'LOG',
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
    FIND = 'Find',
    FIND_NEXT = 'Find Next',
    FIND_PREV = 'Find Previous',
    FIT_TO_SCREEN = 'Toggle Fit to Screen',
    s0001 = 's0001',
    s0002 = 's0002',
    s0003 = 's0003',
    TEST = 'Run Test Block',
}

export const SearchEngine = {
    DUCKDUCKGO: 'https://duckduckgo.com/?q=',
    GOOGLE: 'https://www.google.com/search?q=',
    GOOGLE_AI: 'https://www.google.com/ai?q=',
    BING: 'https://www.bing.com/search?q=',
    YAHOO: 'https://search.yahoo.com/search?p=',
} as const

export const DEFAULT_STATUS: StatusProps = {
    width: 1024,
    height: 728,
    x: NaN,
    y: NaN,
    maxHistory: MAX_HISTORY,
    welcome: true,
    helpText: true,
    adBlocker: true,
    searchEngine: 'DUCKDUCKGO',
    frame: true,
}

export const CTRL = 'ControlOrCommand'

export enum LogTypes {
    ERROR,
    WARN,
    LOG,
    INFO,
}

export enum CustomEvents {
    SWITCH = 'switch',
    UPDATE_SETTINGS = 'update-settings',
}
