import { Store } from '@main/store/store'

type KeystrokesStore = {
    version: string
    keystrokes: Record<string, string> // host: stroke
}

export class Keystrokes extends Store<KeystrokesStore> {
    static instance: Keystrokes
    static getInstance(): Keystrokes {
        if (!Keystrokes.instance) {
            Keystrokes.instance = new Keystrokes()
            Keystrokes.instance.parse()
        }
        return Keystrokes.instance
    }

    protected fileName = 'keystrokes'
    protected defaults = {
        version: '1',
        keystrokes: {},
    }
    protected isSecure = true

    parse() {
        super.parse()

        if (!this.data.version) {
            this.data = {
                version: '1',
                keystrokes: {},
            }
        }

        super.mergeDefault()
    }

    update(host: string, keystroke: string) {
        if (!keystroke) {
            delete this.data.keystrokes[host]
        } else {
            this.data.keystrokes[host] = keystroke
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
