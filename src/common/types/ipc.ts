import type {
    T_Anchor,
    T_Bookmark,
    T_Bookmark_Partial,
} from '@src/common/types/store'
import { IPC_CHANNELS, LogTypes } from '@src/common/constants'
import type {
    Scenes,
    T_Cleaner,
    T_Cloud_Item,
    T_Shortcut_Store,
    T_Status_Props,
} from '@src/common/types'

export type T_IPC_Switch = {
    scene: Scenes
    address?: string
    reloading?: boolean
    searchEngine?: boolean
}

export type T_IPC_Status = {
    request?: (keyof T_Status_Props)[]
    data?: Partial<T_Status_Props>
}

export type T_IPC_Data<T> = {
    message?: string
    item?: T
    meta?: unknown
}

type Context_Item = {
    bookmark: T_Bookmark
    anchor: T_Anchor
    history: T_Bookmark_Partial
    cloud: T_Cloud_Item
}
export type T_IPC_Context<T extends keyof Context_Item> = {
    x: number
    y: number
    type: T
    item: Context_Item[T]
    enabled: string[]
}

export type T_IPC_Message = {
    [IPC_CHANNELS.ANCHOR]: T_Anchor[] | T_Bookmark_Partial
    [IPC_CHANNELS.BOOKMARK]: T_Bookmark[] | T_Bookmark_Partial | string
    [IPC_CHANNELS.STATUS]: T_IPC_Status
    [IPC_CHANNELS.SWITCH]: T_IPC_Switch
    [IPC_CHANNELS.HISTORY]: T_Bookmark[] | number
    [IPC_CHANNELS.POPUP_BLOCKER]: [string[], string[]]
    [IPC_CHANNELS.FIND]: {
        text: string
        forward?: boolean
        stop?: boolean
        reset?: boolean
        focus?: boolean
        matches?: number
        activeMatchOrdinal?: number
    }
    [IPC_CHANNELS.LOG]: [LogTypes, unknown[]]
    [IPC_CHANNELS.KEYSTROKES]: Record<string, string>
    [IPC_CHANNELS.SHORTCUTS]: T_Shortcut_Store
    [IPC_CHANNELS.CLEANER]: T_Cleaner
    [IPC_CHANNELS.CLOUD]: T_IPC_Data<T_Cloud_Item>
    [IPC_CHANNELS.CLOUD_RESPONSE]: T_Cloud_Item[]
    [IPC_CHANNELS.FAVICON]: [string, string]
    [IPC_CHANNELS.CONTEXT]: T_IPC_Context<keyof Context_Item>
}
