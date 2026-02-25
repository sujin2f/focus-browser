import { A_Entry } from './abs-entry'
/* <HTML template-part /> */
import { List } from '@home/template-parts/list'
/* Utils */
import { getSection } from '@home/utils'
import { ListItem } from '../../template-parts/list-item'

type T_Items<T> = { data: T; items: ListItem[] }[]

export abstract class A_List<T> extends A_Entry {
    protected _items: T_Items<T> = []
    public get items() {
        return this._items
    }
    protected set items(items: T_Items<T>) {
        this._items = items
    }
    protected list!: List

    constructor(css: string = '') {
        super()
        this.list = new List(css)
    }

    protected renderList() {
        getSection('list').innerHTML = ''
    }
}
