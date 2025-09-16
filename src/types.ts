export type Bookmark = {
    url: string
    title: string
    shortcut?: string
}

export enum Scenes {
    Browser,
    Home,
    Address, // home with address bar focused
}

export enum IPC_Channels {
    Switch = 'Switch',
    Bookmarks = 'Bookmarks',
    History = 'History',
    Anchors = 'Anchors',
    PopupBlocker = 'PopupBlocker',
}

export enum IPC_RequestHandler {
    Request = 'Request',
    Response = 'Response',
    Add = 'Add',
    Modify = 'Modify',
    Remove = 'Remove',
    Execute = 'Execute',
}

// CC: Control Centre
export enum CC_Pages {
    Home,
    Address,
    Bookmark,
    History,
    Anchor,
    PopupBlocker,
}

export enum CC_Modes {
    List,
    New,
    Edit,
    Find,
}

export type PopupBlocker = {
    host: string
    allowed?: boolean
}
