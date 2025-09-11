import HTMLFragment from '.'

export default class Tr extends HTMLFragment<HTMLTableRowElement> {
    public appendChild(element: HTMLElement) {
        this.element.appendChild(element)
    }

    constructor() {
        super('template--table__tr')
    }
}
