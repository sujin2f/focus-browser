import type { MenuItemConstructorOptions, NavigationEntry } from 'electron'
import {
    Menu,
    MenuCategory,
    CENTRE_PAGES,
    BROWSER,
    SEARCH_ENGINES,
    IPC_CHANNELS,
    LogTypes,
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
export interface T_Bookmark extends NavigationEntry {
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
type T_Cleaner_Response = {
    cacheSize: number
    anchors: number
    history: number
    popup: number
    indexedDB: number
}
export type T_Cleaner = {
    request?: string
    response?: T_Cleaner_Response
}

export type T_Shortcut_Store = {
    [P in Menu]?: string
}

/**
 * Message to sujinc.com
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

export type Scenes = CENTRE_PAGES | typeof BROWSER

export type MenuItems = Partial<Record<Menu, MenuItemConstructorOptions>>
export type MenuBlock = Partial<Record<MenuCategory, MenuItems>>

export type T_IPC_Message = {
    [IPC_CHANNELS.ANCHOR]: T_Bookmark[]
    [IPC_CHANNELS.BOOKMARK]: T_Bookmark[]
    [IPC_CHANNELS.STATUS]: T_IPC_Status
    [IPC_CHANNELS.SWITCH]: T_IPC_Switch
    [IPC_CHANNELS.HISTORY]: T_Bookmark[]
    [IPC_CHANNELS.POPUP_BLOCKER]: [string[], string[]]
    [IPC_CHANNELS.FIND]: string
    [IPC_CHANNELS.LOG]: [LogTypes, unknown[]]
    [IPC_CHANNELS.KEYSTROKES]: Record<string, string>
    [IPC_CHANNELS.SHORTCUTS]: T_Shortcut_Store
    [IPC_CHANNELS.CLEANER]: T_Cleaner
    [IPC_CHANNELS.CLOUD]: T_Cloud_Item[]
}
