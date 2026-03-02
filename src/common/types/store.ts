import type { NavigationEntry } from 'electron'

export type T_Stores = {
    favicon: T_Favicon
    bookmark: T_Bookmark
}

// 🔖 Bookmark
export interface T_Bookmark extends NavigationEntry {
    uid?: number
    id: string
    url: string
    title: string
    shortcut?: string
    parent?: string
    dir?: boolean
    type?: 'bookmark' | 'anchor'
}

// 🅕 Favicon
export type T_Favicon = {
    host: string
    image: string
    timestamp: number
    bookmarked?: boolean
}
