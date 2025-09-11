import type { NavigationEntry } from 'electron'
import Store from './store'

export default class History extends Store<{
    index: number
    history: NavigationEntry[]
}> {
    constructor() {
        super(
            'history',
            {
                index: 0,
                history: [],
            },
            false,
        )
    }

    public get index() {
        return this.get('index') as number
    }

    public get entries() {
        return this.get('history') as NavigationEntry[]
    }

    public get current() {
        if (this.data.history.length) {
            return this.data.history.at(this.data.index)
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

        this.data = { index, history }
        super.save()
    }
}
