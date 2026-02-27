import type { T_Status_Store_Props } from '@src/common/types'

export const MAX_HISTORY = 200
export const SUJINC_DOMAIN = 'sujinc.com' // sujinc.com | localhost
export const SUJINC_URL = 'https://sujinc.com' // https://sujinc.com | http://localhost:8000

/**
 * Control centre pages
 */
export enum CENTRE_PAGES {
    // TODO merge CENTRE_PAGES, and BROWSER
    RELOAD,
    ADDRESS,
    HISTORY,
    SETTING,
    SHORTCUT,
    KEYSTROKES,
    OFFLINE = 'offline.html',
    FIND = 'find.html',
    POPUP_BLOCKER = 'popup.html',
    ANCHOR = 'anchors.html',
    BOOKMARK = 'bookmarks.html',
    HOME = 'main.html',
    WELCOME = 'welcome.html',
    IMPORTER = 'importer.html',
}

export const BROWSER = 'scene-browser'

export enum IPC_CHANNELS {
    STATUS = 'STATUS',
    SWITCH = 'SWITCH',
    BOOKMARK = 'BOOKMARK',
    BOOKMARK_RESPONSE = 'BOOKMARK_RESPONSE',
    HISTORY = 'HISTORY',
    ANCHOR = 'ANCHOR',
    POPUP_BLOCKER = 'POPUP_BLOCKER',
    FIND = 'FIND',
    LOG = 'LOG',
    MAIN_PROCESS = 'MAIN_PROCESS',
    KEYSTROKES = 'KEYSTROKES',
    SHORTCUTS = 'SHORTCUTS',
    CLEANER = 'CLEANER',
    CLOUD = 'CLOUD',
}

export enum REQUEST_HANDLER {
    REQUEST = 'REQUEST',
    RESPONSE = 'RESPONSE',
    RESPONSE_SUCCESS = 'RESPONSE_SUCCESS',
    RESPONSE_FAIL = 'RESPONSE_FAIL',
    ADD = 'ADD',
    MODIFY = 'MODIFY',
    REMOVE = 'REMOVE',
    EXECUTE = 'EXECUTE',
    PUT = 'PUT',
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
    PASTE_KEYSTROKE = 'Paste Keystroke',
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
    BACK_HIDDEN = 'Address Back',
    FORWARD = 'Forward',
    FORWARD_HIDDEN = 'Address Forward',
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

export const EMOJI: Record<string, string> = {
    [Menu.PASTE_KEYSTROKE]: '🎹',
    [Menu.ADD_BOOKMARK]: '🔖',
    [Menu.ADD_ANCHOR]: '⚓️',
    CLEANER: '🧼',
    HISTORY: '📝',
    POPUP_BLOCKER: '👮',
    SHORTCUTS: '🏁',
    SETTINGS: '⚙️',
    HAND_HEART: '🫰',
    FOCUS: '🅕',
    FOLDER_OPEN: '📂',
    FOLDER_CLOSE: '📁',
    CHECKED: '✅',
    GLOBE: '🌏',
    CENTRE: '🎛️',
    LOGIN: '🙋‍♀️',
    CLOUD: '☁️',
}

export const SEARCH_ENGINES = {
    DUCKDUCKGO: 'https://duckduckgo.com/?q=',
    GOOGLE: 'https://www.google.com/search?q=',
    GOOGLE_AI: 'https://www.google.com/ai?q=',
    BING: 'https://www.bing.com/search?q=',
    YAHOO: 'https://search.yahoo.com/search?p=',
} as const

export const DEFAULT_STATUS: T_Status_Store_Props = {
    width: 1024,
    height: 728,
    x: NaN,
    y: NaN,
    maxHistory: MAX_HISTORY,
    adBlocker: true,
    searchEngine: 'DUCKDUCKGO',
    machineId: 'N/A',
}

export const CTRL = 'ControlOrCommand'

export enum LogTypes {
    ERROR,
    WARN,
    LOG,
    INFO,
}

export enum MainEventTypes {
    TITLE = 'TITLE',
    SWITCH = 'SWITCH',
    CONTEXT_MENU = 'CONTEXT_MENU',
}

export const DEFAULT_SHORTCUTS: Record<Menu, Record<SystemType, string>> = {
    [Menu.HIDE]: {
        [SystemType.DARWIN]: 'Command+H',
        [SystemType.DEFAULT]: '',
    },
    [Menu.HIDE_OTHERS]: {
        [SystemType.DARWIN]: 'Command+Shift+H',
        [SystemType.DEFAULT]: '',
    },
    [Menu.QUIT]: {
        [SystemType.DARWIN]: 'Command+Q',
        [SystemType.DEFAULT]: 'Control+Q',
    },
    [Menu.UNDO]: {
        [SystemType.DARWIN]: 'Command+Z',
        [SystemType.DEFAULT]: 'Control+Z',
    },
    [Menu.REDO]: {
        [SystemType.DARWIN]: 'Command+Shift+Z',
        [SystemType.DEFAULT]: 'Control+Shift+Z',
    },
    [Menu.CUT]: {
        [SystemType.DARWIN]: 'Command+X',
        [SystemType.DEFAULT]: 'Control+X',
    },
    [Menu.COPY]: {
        [SystemType.DARWIN]: 'Command+C',
        [SystemType.DEFAULT]: 'Control+C',
    },
    [Menu.PASTE]: {
        [SystemType.DARWIN]: 'Command+V',
        [SystemType.DEFAULT]: 'Control+V',
    },
    [Menu.SELECT_ALL]: {
        [SystemType.DARWIN]: 'Command+A',
        [SystemType.DEFAULT]: 'Control+A',
    },
    [Menu.ADD_BOOKMARK]: {
        [SystemType.DARWIN]: 'Command+D',
        [SystemType.DEFAULT]: 'Control+D',
    },
    [Menu.ADD_ANCHOR]: {
        [SystemType.DARWIN]: 'Command+/',
        [SystemType.DEFAULT]: 'Control+/',
    },
    [Menu.PASTE_KEYSTROKE]: {
        [SystemType.DARWIN]: 'Command+K',
        [SystemType.DEFAULT]: 'Control+K',
    },
    [Menu.FULL_SCREEN]: {
        [SystemType.DARWIN]: 'Command+Control+F',
        [SystemType.DEFAULT]: 'F11',
    },
    [Menu.RESET_ZOOM]: {
        [SystemType.DARWIN]: 'Command+0',
        [SystemType.DEFAULT]: 'Control+0',
    },
    [Menu.ZOOM_IN]: {
        [SystemType.DARWIN]: 'Command+=',
        [SystemType.DEFAULT]: 'Control+=',
    },
    [Menu.ZOOM_OUT]: {
        [SystemType.DARWIN]: 'Command+-',
        [SystemType.DEFAULT]: 'Control+-',
    },
    [Menu.DEVTOOLS]: {
        [SystemType.DARWIN]: 'Command+Option+I',
        [SystemType.DEFAULT]: 'Control+Shift+I',
    },
    [Menu.ADDRESS]: {
        [SystemType.DARWIN]: 'Command+L',
        [SystemType.DEFAULT]: 'Control+L',
    },
    [Menu.CENTRE]: {
        [SystemType.DARWIN]: 'Command+`',
        [SystemType.DEFAULT]: 'Control+`',
    },
    [Menu.BACK]: {
        [SystemType.DARWIN]: 'Command+[',
        [SystemType.DEFAULT]: 'Control+[',
    },
    [Menu.FORWARD]: {
        [SystemType.DARWIN]: 'Command+]',
        [SystemType.DEFAULT]: 'Control+]',
    },
    [Menu.RELOAD]: {
        [SystemType.DARWIN]: 'Command+R',
        [SystemType.DEFAULT]: 'Control+R',
    },
    [Menu.MINIMIZE]: {
        [SystemType.DARWIN]: 'Command+M',
        [SystemType.DEFAULT]: '',
    },
    [Menu.CLOSE]: {
        [SystemType.DARWIN]: 'Command+W',
        [SystemType.DEFAULT]: '',
    },
    [Menu.FIND]: {
        [SystemType.DARWIN]: 'Command+F',
        [SystemType.DEFAULT]: 'Control+F',
    },
    [Menu.FIND_NEXT]: {
        [SystemType.DARWIN]: 'Command+G',
        [SystemType.DEFAULT]: 'Control+G',
    },
    [Menu.FIND_PREV]: {
        [SystemType.DARWIN]: 'Shift+Command+G',
        [SystemType.DEFAULT]: 'Shift+Control+G',
    },
    [Menu.FIT_TO_SCREEN]: {
        [SystemType.DARWIN]: 'Command+Escape',
        [SystemType.DEFAULT]: 'Control+Escape',
    },
    [Menu.ABOUT]: {
        [SystemType.DARWIN]: '',
        [SystemType.DEFAULT]: '',
    },
    [Menu.SHOW_ALL]: {
        [SystemType.DARWIN]: '',
        [SystemType.DEFAULT]: '',
    },
    [Menu.BACK_HIDDEN]: {
        [SystemType.DARWIN]: 'Command+Left',
        [SystemType.DEFAULT]: 'Control+Left',
    },
    [Menu.FORWARD_HIDDEN]: {
        [SystemType.DARWIN]: 'Command+Right',
        [SystemType.DEFAULT]: 'Control+Right',
    },
    [Menu.STOP]: {
        [SystemType.DARWIN]: 'Escape',
        [SystemType.DEFAULT]: 'Escape',
    },
    [Menu.BRING_TO_FRONT]: {
        [SystemType.DARWIN]: '',
        [SystemType.DEFAULT]: '',
    },
    [Menu.s0001]: {
        [SystemType.DARWIN]: '',
        [SystemType.DEFAULT]: '',
    },
    [Menu.s0002]: {
        [SystemType.DARWIN]: '',
        [SystemType.DEFAULT]: '',
    },
    [Menu.s0003]: {
        [SystemType.DARWIN]: '',
        [SystemType.DEFAULT]: '',
    },
    [Menu.TEST]: {
        [SystemType.DARWIN]: '',
        [SystemType.DEFAULT]: '',
    },
}

export const EDITABLE_SHORTCUTS: Partial<Record<MenuCategory, Menu[]>> = {
    [MenuCategory.EDIT]: [
        Menu.ADD_BOOKMARK,
        Menu.ADD_ANCHOR,
        Menu.PASTE_KEYSTROKE,
    ],
    [MenuCategory.NAVIGATE]: [
        Menu.CENTRE,
        Menu.ADDRESS,
        Menu.BACK_HIDDEN,
        Menu.FORWARD_HIDDEN,
    ],
}
