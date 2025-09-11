import { CC_Pages } from '@src/types'

export default class Page {
    public readonly page: CC_Pages
    protected _mode = 0
    public get mode() {
        return this._mode
    }
    public set mode(mode: number) {
        this._mode = mode
    }

    constructor() {
        this.root.innerHTML = ''
    }

    protected get root() {
        return document.getElementById('root')
    }

    focus() {}
    back() {
        this.mode = 0
    }
    update(...arg: unknown[]) {}

    // Navigation
    arrowUp() {}
    arrowDown() {}

    // Current value action
    getValue(): unknown {
        return
    }
    remove() {}
    edit() {}
    action(...arg: unknown[]) {}
}
