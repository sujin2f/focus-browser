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
    welcome: boolean
    helpText: boolean
    adBlocker: boolean
    searchEngine: keyof typeof SEARCH_ENGINES
    frame: boolean
}

/**
 * for IPC comm.
 */
export type Info = Partial<
    StatusProps & {
        shortcuts: Record<string, string>
        cacheSize: number
        title: string
        url: string
        adBlockerStatus: boolean | null
        findText: string
        maximize: boolean
        keystrokes: Record<string, string>
    }
>

export type Bookmark = {
    url: string
    title: string
    shortcut?: string
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
