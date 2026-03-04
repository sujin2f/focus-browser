import type { NavigationEntry } from 'electron'
import { BOOKMARK_TYPES } from '@src/common/constants'

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
    type?: BOOKMARK_TYPES
}

// 🅕 Favicon
export type T_Favicon = {
    host: string
    image: string
    timestamp: number
    bookmarked?: boolean
}
