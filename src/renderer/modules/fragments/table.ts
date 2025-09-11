import HTMLFragment from '.'
import Tr from './tr'
import Th from './th'
import Td from './td'

export default class Table extends HTMLFragment<HTMLTableElement> {
    public set th(title: string) {
        const th = new Th()
        th.title = title
        this.element.querySelector('thead tr').appendChild(th.element)
    }

    private _rows: Tr[] = []
    public get rows() {
        return this._rows
    }

    constructor() {
        super('template--table')
    }

    public createRow() {
        const tr = new Tr()
        this._rows.push(tr)
        this.element.querySelector('tbody').appendChild(tr.element)
        return tr
    }

    public createCell() {
        const td = new Td()
        this._rows.at(this._rows.length - 1).appendChild(td.element)
        return td
    }

    public reset() {
        this.element.remove()
        this._rows = []
        this.element = this.template
    }
}
