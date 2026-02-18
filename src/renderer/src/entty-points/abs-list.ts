import { A_Entry } from './abs-entry'
/* <HTML template-part /> */
import { List } from '@src/renderer/src/template-parts/list'

export abstract class A_List<T> extends A_Entry {
    protected items: T[] = []
    protected listItems: T[] = []
    protected list!: List

    constructor(css: string = '') {
        super()
        this.list = new List(css)
    }

    abstract renderList(): void
}
