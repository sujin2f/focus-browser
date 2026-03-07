import type { MenuItemConstructorOptions } from 'electron'
import type { ListItem } from '@src/renderer/src/template-parts/list-item'
import {
    Menu,
    MenuCategory,
    CENTRE_PAGES,
    BROWSER,
    SEARCH_ENGINES,
    FIND,
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
    machineId: string
}

export type T_Status_Props = Partial<
    T_Status_Store_Props & {
        title: string
        url: string
        adBlockerStatus: boolean | null
        findText: string
        userInfo: string
    }
>

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
export type T_Cleaner_Response = {
    cacheSize: string
    anchors: string
    history: string
    popup: string
    indexedDB: string
}
export type T_Cleaner = {
    request?: string
    response?: T_Cleaner_Response
}

export type T_Shortcut_Store = {
    [P in Menu]?: string
}

/**
 * ☁️ Message to sujinc.com
 * This should match to
 * @see https://github.com/sujin2f/Sujin/blob/trunk/%40lib/src/types/focus.ts
 */
export type T_Cloud_Item = {
    _id?: string
    title: string
    key: string
    type: 'bookmark' | 'keystroke' | 'return'
    device?: string
    machineId?: string
    message?: string
}

export type Scenes = CENTRE_PAGES | typeof BROWSER | typeof FIND

export type MenuItems = Partial<Record<Menu, MenuItemConstructorOptions>>
export type MenuBlock = Partial<Record<MenuCategory, MenuItems>>

export type T_Items<T> = { data: T; items: ListItem[] }[]
export type T_Dir<T> = Record<
    string,
    {
        data: T
        hidden: boolean
        dir: ListItem[]
        items: ListItem[]
    }
>
