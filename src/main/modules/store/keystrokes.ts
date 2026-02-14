import { Store } from '@main/modules/store/store'

type KeystrokesStore = {
    version: string
    keystrokes: Record<string, string> // host: stroke
}

export class Keystrokes extends Store<KeystrokesStore> {
    static instance: Keystrokes
    static getInstance(): Keystrokes {
        if (!Keystrokes.instance) {
            Keystrokes.instance = new Keystrokes('keystrokes', {
                version: '1',
                keystrokes: {},
            })
            Keystrokes.instance.parse()
        }
        return Keystrokes.instance
    }

    parse() {
        super.parse()

        if (!this.data.version) {
            this._data = {
                version: '1',
                keystrokes: {},
            }
        }
    }

    update(host: string, keystroke: string) {
        if (!keystroke) {
            delete this._data.keystrokes[host]
        } else {
            this._data.keystrokes[host] = keystroke
        }
    }

    getKeystroke(host: string): string {
        return this.data.keystrokes[host]
    }

    /**
     * Get all keystrokes
     * @returns {Record<string, string>}
     */
    getKeystrokes(): Record<string, string> {
        return this.data.keystrokes
    }
}
