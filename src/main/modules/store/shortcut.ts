import Store from '@main/modules/store/store'
import { SHORTCUTS } from '@main/settings/shortcut'
import { ShortcutStore } from '@src/types'

export default class Shortcut extends Store<ShortcutStore> {
    static instance: Shortcut
    static getInstance(): Shortcut {
        if (!Shortcut.instance) {
            if (process.platform !== 'darwin') {
                Shortcut.instance = new Shortcut('shortcut', SHORTCUTS.default)
            } else {
                Shortcut.instance = new Shortcut('shortcut', SHORTCUTS.darwin)
            }

            Shortcut.instance.parse()
        }
        return Shortcut.instance
    }
}
