import { A_Entry } from './abs-entry'
/* <HTML template-part /> */
import { List } from '@home/template-parts/list'
import { ListItem } from '@home/template-parts/list-item'
/* Models */
import { Logger } from '@src/common/logger'
/* CONSTANTS */
import { EMOJI } from '@src/common/constants'
/* T_Types */
import type { T_Dir, T_Items } from '@src/common/types'

export abstract class A_List<T> extends A_Entry {
    protected items: T_Items<T> = []
    protected dirs: T_Dir<T> = {}
    protected list!: List
    protected folderIndex!: number

    // (En/Dis)able
    private _enabled = false // Default is false
    protected get enabled() {
        return this._enabled
    }
    protected setEnabled(enabled: boolean) {
        if (enabled) {
            this.list.element.classList.remove('section-disabled')
        } else {
            this.list.element.classList.add('section-disabled')
        }
        this._enabled = enabled
    }

    constructor(css: string = '') {
        super()
        this.list = new List(css)
    }

    protected onDirectoryClick(id: string) {
        const data = this.dirs[id]
        if (!data) {
            Logger.getInstance().error('Clicked Dir does not exist.')
            return
        }

        const { hidden, items, dir } = data

        dir[this.folderIndex].title = hidden
            ? EMOJI.FOLDER_OPEN
            : EMOJI.FOLDER_CLOSE

        items.forEach((item) => {
            if (hidden) {
                item.show()
            } else {
                item.hide()
            }
        })
        data.hidden = !hidden
    }

    protected getFaviconColumn(url: string) {
        const icon = new ListItem(EMOJI.GLOBE)
        this.faviconStore.get(url, (favicon) => {
            if (!favicon) return
            const image = document.createElement('img')
            image.src = favicon.image
            image.width = 20
            image.height = 20
            icon.title = image
        })
        return icon
    }
}
