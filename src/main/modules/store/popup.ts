import Store from './store'

export default class Popup extends Store<{
    blocked: Set<string>
    allowed: Set<string>
}> {
    static instance: Popup
    static getInstance(): Popup {
        if (!Popup.instance) {
            Popup.instance = new Popup('popup-blocker', {
                blocked: new Set<string>(),
                allowed: new Set<string>(),
            })
        }
        return Popup.instance
    }

    public modified = false

    public block(request: string) {
        const url = new URL(request)
        this.data.blocked.add(url.host)
        this.data.allowed.delete(url.host)
    }

    public allow(request: string) {
        const url = new URL(request)
        this.data.blocked.delete(url.host)
        this.data.allowed.add(url.host)
    }

    public isAllowed(request: string) {
        const url = new URL(request)
        return this.data.allowed.has(url.host)
    }
}
