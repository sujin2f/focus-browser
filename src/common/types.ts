import type { MenuItemConstructorOptions } from 'electron'
import {
    Menu,
    MenuCategory,
    CENTRE_PAGES,
    BROWSER,
    SEARCH_ENGINES,
} from '@src/common/constants'

/**
 * stores in status.json
 */
export type StatusProps = {
    width: number
    height: number
    x: number
    y: number
    maxHistory: number
    adBlocker: boolean
    searchEngine: keyof typeof SEARCH_ENGINES
}

/**
 * for IPC comm.
 */
export type Info = Partial<
    StatusProps & {
        title: string
        url: string
        adBlockerStatus: boolean | null
        findText: string
    }
>

export type T_Bookmark = {
    url: string
    title: string
    shortcut?: string
    children?: T_Bookmark[]
}

export type PopupBlocker = {
    host: string
    allowed?: boolean
}

export type Scenes = CENTRE_PAGES | typeof BROWSER

export type MenuItems = Partial<Record<Menu, MenuItemConstructorOptions>>
export type MenuBlock = Partial<Record<MenuCategory, MenuItems>>

export type ElementProps<T> = {
    tag: string
    selector: string
    className: string[]
    hide: boolean
    value: string
    props: T
    onClick: (ev: HTMLElementEventMap['click']) => unknown
}

export type EventSwitch = CustomEvent<CENTRE_PAGES>

export type T_Cleaner = {
    cacheSize: number
    anchors: number
    history: number
    popup: number
    indexedDB: number
}
