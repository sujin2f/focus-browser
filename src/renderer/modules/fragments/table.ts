import { A_HTMLFragment } from '.'
import Th from './th'

export default class Table extends A_HTMLFragment<HTMLTableElement> {
    public set th(text: string) {
        const th = new Th()
        th.innerHTML = text
        this.element.querySelector('thead tr').appendChild(th.element)
    }

    constructor() {
        super('template--table', 'tbody')
    }
}
