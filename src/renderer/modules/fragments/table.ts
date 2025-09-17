import { A_HTMLFragment } from '.'
import Th from './th'
import Tr from './tr'

export default class Table extends A_HTMLFragment<HTMLTableElement> {
    protected _children: Tr[] = []

    public set th(text: string) {
        const th = new Th()
        th.innerHTML = text
        this.element.querySelector('thead tr').appendChild(th.element)
    }

    constructor() {
        super('template--table', 'tbody')
    }

    public get children() {
        return this._children
    }
}
