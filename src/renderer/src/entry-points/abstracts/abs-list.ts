import { A_Entry } from './abs-entry'
/* <HTML template-part /> */
import { List } from '@src/renderer/src/template-parts/list'
/* Utils */
import { getSection } from '@src/renderer/src/utils'
import { ListItem } from '../../template-parts/list-item'

export abstract class A_List<T> extends A_Entry {
    protected items: { data: T; items: ListItem[] }[] = []
    protected list!: List

    constructor(css: string = '') {
        super()
        this.list = new List(css)
    }

    protected renderList() {
        getSection('list').innerHTML = ''
    }
}
