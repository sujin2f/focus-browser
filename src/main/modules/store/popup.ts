import * as fs from 'fs'
import Store from './store'

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
        if (this.data.blocked.has(host)) {
            this.allow(host)
        } else {
            this.block(host)
        }
    }

    public block(host: string) {
        this.data.blocked.add(host)
        this.data.allowed.delete(host)
    }

    public allow(host: string) {
        this.data.blocked.delete(host)
        this.data.allowed.add(host)
    }

    public isAllowed(host: string) {
        return this.data.allowed.has(host)
    }

    save() {
        fs.writeFileSync(
            this.path,
            JSON.stringify({
                blocked: Array.from(this.data.blocked),
                allowed: Array.from(this.data.allowed),
            }),
            {
                encoding: 'utf-8',
            },
        )
    }

    parse() {
        try {
            const parsed = JSON.parse(fs.readFileSync(this.path, 'utf-8'))
            this.data = {
                blocked: new Set(parsed.blocked),
                allowed: new Set(parsed.allowed),
            }
        } catch (error) {
            this.data = this.defaults
        }
    }
}
