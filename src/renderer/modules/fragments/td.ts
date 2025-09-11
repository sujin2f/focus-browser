import HTMLFragment from '.'

export default class Td extends HTMLFragment<HTMLTableCellElement> {
    public appendChild(element: HTMLElement) {
        this.element.appendChild(element)
    }

    constructor() {
        super('template--table__td')
    }
}
