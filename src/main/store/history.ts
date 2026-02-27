import type { NavigationEntry, NavigationHistory } from 'electron'
import { Store } from '@main/store/store'
import { MAX_HISTORY } from '@src/common/constants'

type Props = {
    index: number
    history: NavigationEntry[]
}

export class History extends Store<Props> {
    protected fileName = 'history'
    protected defaults = { index: NaN, history: [] } as Props

    public get current() {
        if (this._data.history.length) {
            return this._data.history.at(this._data.index)
        }

        return
    }

    parse() {
        super.parse()
        super.mergeDefault()
    }

    /**
     * Save history from browser history
     *
     * @param {NavigationHistory} navHistory
     * @param {number} maxContents
     */
    save(navHistory: NavigationHistory, maxContents: number = MAX_HISTORY) {
        const current = navHistory.getEntryAtIndex(
            navHistory.getActiveIndex(),
        ).url

        const unique: string[] = []
        const history = navHistory
            .getAllEntries()
            .reverse()
            .filter((v) => {
                if (unique.indexOf(v.url) === -1) {
                    unique.unshift(v.url)
                    return true
                }

                return false
            })
            .slice(0, maxContents)
            .reverse()
        const urls = history.map((v) => v.url)
        const index = urls.indexOf(current)

        this._data = {
            index: index !== -1 ? index : history.length - 1,
            history,
        }
        super.save()
    }
}
