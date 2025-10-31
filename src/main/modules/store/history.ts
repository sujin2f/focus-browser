import type { NavigationEntry } from 'electron'
import Store from '@main/modules/store/store'

export default class History extends Store<{
    index: number
    history: NavigationEntry[]
}> {
    constructor() {
        super('history', {
            index: NaN,
            history: [],
        })
    }

    public get index() {
        return this.get('index') as number
    }

    public get entries() {
        return this.get('history') as NavigationEntry[]
    }

    public get current() {
        if (this._data.history.length) {
            return this._data.history.at(this._data.index)
        }

        return
    }

    public write(
        _index: number,
        _history: NavigationEntry[],
        maxContents = 200,
    ) {
        const shift = _history.length - maxContents
        const index = shift > 0 ? _index - shift : _index
        const history = _history.slice(shift)

        this._data = { index, history }
        super.save()
    }
}
