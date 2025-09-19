import { A_HTMLFragment } from '.'
import Tr from './tr'

export default class Table extends A_HTMLFragment<HTMLTableElement> {
    protected _children: Tr[] = []

    public set head(tr: Tr | null) {
        if (!tr) {
            this.element.querySelector('thead').innerHTML = ''
            return
        }
        this.element.querySelector('thead').appendChild(tr.element)
    }

    constructor() {
        super('template--table', 'tbody')
    }

    public get children() {
        return this._children
    }
}
