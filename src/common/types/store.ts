import type { NavigationEntry } from 'electron'

export type T_Stores = {
    favicon: T_Favicon
    bookmark: T_Bookmark
    anchor: T_Anchor
}

// To send url & title via IPC
export type T_Bookmark_Partial = {
    url: string
    title: string
}

// ⚓️ Anchor
export type T_Anchor = T_Bookmark_Partial & {
    uid: number
    id: string
}

// 🔖 Bookmark
export type T_Bookmark = T_Anchor &
    NavigationEntry & {
        uid?: number
        shortcut?: string
        parent?: string
        dir?: boolean
    }

// 🅕 Favicon
export type T_Favicon = {
    host: string
    image: string
    timestamp: number
    bookmarked?: boolean
}
