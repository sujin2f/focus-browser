import type { MenuItemConstructorOptions } from 'electron'
import {
    Menu,
    MenuCategory,
    CENTRE_PAGES,
    BROWSER,
    SEARCH_ENGINES,
} from '@src/common/constants'

/**
 * Status
 */
export type T_Status_Store_Props = {
    width: number
    height: number
    x: number
    y: number
    maxHistory: number
    adBlocker: boolean
    searchEngine: keyof typeof SEARCH_ENGINES
}

export type T_Status_Props = Partial<
    T_Status_Store_Props & {
        title: string
        url: string
        adBlockerStatus: boolean | null
        findText: string
    }
>

export type T_IPC_Status = {
    request?: (keyof T_Status_Props)[]
    data?: Partial<T_Status_Props>
}

/**
 * Switch
 */
export type T_IPC_Switch = {
    scene: Scenes
    address?: string
    reloading?: boolean
    lastVisit?: boolean
    searchEngine?: boolean
}

/**
 * Bookmark
 */
export type T_Bookmark = {
    id: string
    url: string
    title: string
    shortcut?: string
    parent?: string
}

/**
 * Popup Blocker
 */
export type PopupBlocker = {
    host: string
    allowed?: boolean
}

/**
 * Cleaner
 */
export type T_Cleaner = {
    cacheSize: number
    anchors: number
    history: number
    popup: number
    indexedDB: number
}

export type Scenes = CENTRE_PAGES | typeof BROWSER

export type MenuItems = Partial<Record<Menu, MenuItemConstructorOptions>>
export type MenuBlock = Partial<Record<MenuCategory, MenuItems>>
