import type { MenuItemConstructorOptions } from 'electron'
import {
    Menu,
    MenuCategory,
    PageType,
    BROWSER,
    SearchEngine,
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
    searchEngine: keyof typeof SearchEngine
    frame: boolean
}

/**
 * for IPC comm.
 */
export type Info = Partial<
    StatusProps & {
        shortcuts: Shortcuts
        cacheSize: number
        title: string
        url: string
        adBlockerStatus: boolean | null
        findText: string
        maximize: boolean
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

export type Scenes = PageType | typeof BROWSER

type MenuItems = Partial<Record<Menu, MenuItemConstructorOptions>>
export type Shortcuts = Record<string, Menu>
export type MenuBlock = Partial<Record<MenuCategory, MenuItems>>
export type ShortcutStore = {
    menu: MenuBlock
    shortcuts: Shortcuts
}

export type ElementProps<T> = {
    tag: string
    selector: string
    className: string[]
    hide: boolean
    value: string
    props: T
    onClick: (ev: HTMLElementEventMap['click']) => unknown
}

export type EventSwitch = CustomEvent<PageType>
export type EventModifyOption = CustomEvent<Partial<Info>>
