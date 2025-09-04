import type { NavigationEntry } from 'electron'
import Store from './store'

export default class HistoryContainer extends Store<{
    index: number
    history: NavigationEntry[]
}> {
    // Singleton instance
    /* eslint-disable-next-line no-use-before-define */
    static instance: HistoryContainer
    static getInstance(): HistoryContainer {
        if (!HistoryContainer.instance) {
            HistoryContainer.instance = new HistoryContainer('history', {
                index: 0,
                history: [],
            })
        }
        return HistoryContainer.instance
    }

    public get current() {
        if (this.data.history.length) {
            return this.data.history.at(this.data.history.length - 1)
        }

        return
    }

    public push(index: number, history: NavigationEntry[]) {
        this.data = { index, history }
        super.save()
    }
}
