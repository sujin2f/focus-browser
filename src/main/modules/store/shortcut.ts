/* Models */
import { Store } from '@main/modules/store/store'
/* CONSTANTS */
import {
    DEFAULT_SHORTCUTS,
    EDITABLE_SHORTCUTS,
    Menu,
    MenuCategory,
    SystemType,
} from '@src/common/constants'
/* T_Types */
import type { T_Shortcut_Store } from '@src/common/types'

type ShortcutStore = {
    version: string
    shortcuts: T_Shortcut_Store
}

export class Shortcut extends Store<ShortcutStore> {
    constructor() {
        super('shortcut', {
            version: '1',
            shortcuts: {},
        })
        this.parse()
    }

    parse() {
        super.parse()

        if (!this.data.version) {
            this._data = {
                version: '1',
                shortcuts: {},
            }
        }
    }

    update(shortcuts: T_Shortcut_Store) {
        this._data.shortcuts = {
            ...this._data.shortcuts,
            ...shortcuts,
        }
    }

    getShortcut(menu: keyof T_Shortcut_Store): string | void {
        return this.data.shortcuts[menu]
    }

    /**
     * Get all shortcuts -- default and user defined
     * @returns T_Shortcut_Store Merged shortcuts
     */
    getShortcuts(): T_Shortcut_Store {
        const system =
            process.platform === 'darwin'
                ? SystemType.DARWIN
                : SystemType.DEFAULT
        const shortcuts: T_Shortcut_Store = {}
        Object.keys(DEFAULT_SHORTCUTS).forEach((key: string) => {
            shortcuts[key as Menu] = DEFAULT_SHORTCUTS[key as Menu][system]
        })
        return { ...shortcuts, ...this.data.shortcuts } as T_Shortcut_Store
    }

    /**
     * Get editable shortcuts
     * @returns T_Shortcut_Store Merged shortcuts
     */
    getEditable(): T_Shortcut_Store {
        const editable = [
            ...EDITABLE_SHORTCUTS[MenuCategory.EDIT]!,
            ...EDITABLE_SHORTCUTS[MenuCategory.NAVIGATE]!,
        ]
        const result: T_Shortcut_Store = {}
        const shortcuts = this.getShortcuts()
        Object.keys(shortcuts).forEach((key: string) => {
            if (editable.includes(key as Menu)) {
                result[key as Menu] = shortcuts[key as Menu]
            }
        })
        return result
    }
}
