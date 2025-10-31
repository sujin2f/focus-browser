import { Bookmark } from '@src/types'
import Store from '@main/modules/store/store'

type Props = { anchors: Bookmark[] }

export default class Anchors extends Store<Props> {
    static instance: Anchors
    static getInstance(): Anchors {
        if (!Anchors.instance) {
            Anchors.instance = new Anchors('anchors', { anchors: [] })
            Anchors.instance.parse()
        }
        return Anchors.instance
    }

    get() {
        return this._data.anchors
    }

    push(anchor: Bookmark) {
        for (const item of this._data.anchors) {
            if (item.url === anchor.url) {
                return false
            }
        }

        this._data.anchors.unshift(anchor)
        return true
    }

    remove(url: string) {
        for (let [index, item] of this._data.anchors.entries()) {
            if (item.url === url) {
                this._data.anchors.splice(index, 1)
                return
            }
        }
    }
}
