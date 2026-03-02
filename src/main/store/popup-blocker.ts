import * as fs from 'fs'
import { Store } from '@main/store/store'

type T_Popup = {
    blocked: Set<string>
    allowed: Set<string>
}

export class PopupBlocker extends Store<T_Popup> {
    static instance: PopupBlocker
    static getInstance(userDataPath?: string): PopupBlocker {
        if (!PopupBlocker.instance) {
            PopupBlocker.instance = new PopupBlocker(userDataPath)
            PopupBlocker.instance.parse()
        }
        return PopupBlocker.instance
    }

    protected fileName = 'popup-blocker'
    protected defaults = {
        blocked: new Set<string>(),
        allowed: new Set<string>(),
    }

    public toggle(host: string) {
        if (this.data.blocked.has(host)) {
            this.allow(host)
        } else {
            this.block(host)
        }
    }

    get<K extends keyof T_Popup>(key: K): T_Popup[K] {
        return this.data[key]
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
                blocked: Array.from(this.data.blocked).filter((v) => v),
                allowed: Array.from(this.data.allowed).filter((v) => v),
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
        } catch {
            this.data = this.defaults
        }

        super.mergeDefault()
    }

    clear() {
        this.data.blocked = new Set<string>()
        this.save()
    }
}
