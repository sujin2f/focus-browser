import * as fs from 'fs'
import Store from '@main/modules/store/store'

type T_Popup = {
    blocked: Set<string>
    allowed: Set<string>
}

export default class Popup extends Store<T_Popup> {
    static instance: Popup
    static getInstance(): Popup {
        if (!Popup.instance) {
            Popup.instance = new Popup('popup-blocker', {
                blocked: new Set<string>(),
                allowed: new Set<string>(),
            })
            Popup.instance.parse()
        }
        return Popup.instance
    }

    public modified = false

    public toggle(host: string) {
        if (this._data.blocked.has(host)) {
            this.allow(host)
        } else {
            this.block(host)
        }
    }

    public block(host: string) {
        this._data.blocked.add(host)
        this._data.allowed.delete(host)
    }

    public allow(host: string) {
        this._data.blocked.delete(host)
        this._data.allowed.add(host)
    }

    public isAllowed(host: string) {
        return this._data.allowed.has(host)
    }

    save() {
        fs.writeFileSync(
            this.path,
            JSON.stringify({
                blocked: Array.from(this._data.blocked).filter((v) => v),
                allowed: Array.from(this._data.allowed).filter((v) => v),
            }),
            {
                encoding: 'utf-8',
            },
        )
    }

    parse() {
        try {
            const parsed = JSON.parse(fs.readFileSync(this.path, 'utf-8'))
            this._data = {
                blocked: new Set(parsed.blocked),
                allowed: new Set(parsed.allowed),
            }
        } catch (error) {
            this._data = this.defaults
        }
    }
}
