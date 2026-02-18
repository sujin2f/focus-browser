import { Store } from '@main/modules/store/store'
/* T_Types */
import type { T_Bookmark } from '@src/common/types'

type Props = { anchors: T_Bookmark[] }

export class Anchors extends Store<Props> {
    static instance: Anchors
    static getInstance(): Anchors {
        if (!Anchors.instance) {
            Anchors.instance = new Anchors('anchors', { anchors: [] })
            Anchors.instance.parse()
        }
        return Anchors.instance
    }

    get() {
        return super.get('anchors')
    }

    push(anchor: T_Bookmark) {
        for (const item of this._data.anchors) {
            if (item.url === anchor.url) {
                return false
            }
        }

        this._data.anchors.unshift(anchor)
        return true
    }

    remove(url: string) {
        for (const [index, item] of this._data.anchors.entries()) {
            if (item.url === url) {
                this._data.anchors.splice(index, 1)
                return
            }
        }
    }

    clear() {
        this._data = { anchors: [] }
        this.save()
    }
}
