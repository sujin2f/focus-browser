import { Store } from '@main/modules/store/store'
import { DEFAULT_SHORTCUTS, Menu, SystemType } from '@src/common/constants'

type ShortcutStore = {
    version: string
    shortcuts: Record<string, string>
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

    update(shortcuts: Record<string, string>) {
        this._data.shortcuts = {
            ...this._data.shortcuts,
            ...shortcuts,
        }
    }

    getShortcut(menu: string): string {
        return this.data.shortcuts[menu]
    }

    /**
     * Get all shortcuts -- default and user defined
     * @returns Record<string, string> Merged shortcuts
     */
    getShortcuts(): Record<string, string> {
        const system =
            process.platform === 'darwin'
                ? SystemType.DARWIN
                : SystemType.DEFAULT
        const shortcuts: Record<string, string> = {}
        Object.keys(DEFAULT_SHORTCUTS).forEach((key: string) => {
            shortcuts[key] = DEFAULT_SHORTCUTS[key as Menu][system]
        })
        return { ...shortcuts, ...this.data.shortcuts }
    }
}
