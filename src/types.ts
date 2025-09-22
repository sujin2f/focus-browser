export type Bookmark = {
    url: string
    title: string
    shortcut?: string
}

export type PopupBlocker = {
    host: string
    allowed?: boolean
}

export enum Scenes {
    BROWSER,
    HOME,
    ADDRESS, // home with address bar focused
}

export enum Channel {
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

export enum PageType {
    WELCOME,
    HOME,
    ADDRESS,
    BOOKMARK,
    HISTORY,
    ANCHOR,
    POPUP_BLOCKER,
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
    FOCUS,
    BLUR,
    DELETE,
    EXECUTE,
}
