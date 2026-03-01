import { Store } from '@main/store/store'
/* T_Types */
import type { T_Bookmark } from '@src/common/types'

type Props = { anchors: T_Bookmark[] }

export class Anchors extends Store<Props> {
    protected fileName = 'anchors'
    protected defaults = { anchors: [] } as Props

    constructor(protected userDataPath?: string) {
        super(userDataPath)
        this.parse()
        this.mergeDefault()
    }

    get(): T_Bookmark[] {
        return super.get('anchors') || []
    }

    push(url: string, title: string) {
        const anchor = { url, title, id: '' } satisfies T_Bookmark

        for (const item of this.data.anchors) {
            if (item.url === anchor.url) {
                return false
            }
        }

        this.data.anchors.unshift(anchor)
        return true
    }

    remove(url: string) {
        for (const [index, item] of this.data.anchors.entries()) {
            if (item.url === url) {
                this.data.anchors.splice(index, 1)
                return
            }
        }
    }

    clear() {
        this.data = { anchors: [] }
        this.save()
    }
}
