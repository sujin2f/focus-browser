import { Store } from '@main/modules/store/store'

type ShortcutStore = {
    version: string
    shortcuts: Record<string, string>
}

export class Shortcut extends Store<ShortcutStore> {
    static instance: Shortcut
    static getInstance(): Shortcut {
        if (!Shortcut.instance) {
            Shortcut.instance = new Shortcut('shortcut', {
                version: '1',
                shortcuts: {},
            })
            Shortcut.instance.parse()
        }
        return Shortcut.instance
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

    getShortcut(menu: string) {
        return this.data.shortcuts[menu]
    }
}
