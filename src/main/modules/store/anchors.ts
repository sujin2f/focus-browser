import { Notification } from 'electron'
import { Bookmark } from '@src/types'
import Store from './store'

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
        return this.data.anchors
    }

    push(anchor: Bookmark) {
        for (const item of this.data.anchors) {
            if (item.url === anchor.url) {
                return
            }
        }

        new Notification({
            title: 'Focus',
            body: 'New Anchor Added',
            silent: true,
        }).show()
        this.data.anchors.unshift(anchor)
    }

    remove(index: number) {
        this.data.anchors.splice(index, 1)
    }
}
