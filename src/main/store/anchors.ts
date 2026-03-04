import { Store } from '@main/store/store'
/* T_Types */
import type { T_Bookmark } from '@src/common/types/store'

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
}
