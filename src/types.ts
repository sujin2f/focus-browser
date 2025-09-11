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
    URL = 'URL',
    Switch = 'Switch',
    Bookmarks = 'Bookmarks',
    History = 'History',
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
}
