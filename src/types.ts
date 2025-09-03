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
}

export enum IPC_RequestHandler {
    Request = 'Request',
    Response = 'Response',
    Add = 'Add',
}

export interface I_History {
    [timestamp: string]: Bookmark
}
