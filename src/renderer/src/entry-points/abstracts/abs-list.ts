import { A_Entry } from './abs-entry'
/* <HTML template-part /> */
import { List } from '@home/template-parts/list'
/* Utils */
import { getSection } from '@home/utils'
import { ListItem } from '../../template-parts/list-item'

type T_Items<T> = { data: T; items: ListItem[] }[]

export abstract class A_List<T> extends A_Entry {
    public items: T_Items<T> = []
    public list!: List

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

    public renderList() {
        getSection('list').innerHTML = ''
    }
}
