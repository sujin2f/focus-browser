import HTMLFragment from '.'

export default class Th extends HTMLFragment<HTMLTableCellElement> {
    public set title(title: string) {
        this.element.querySelector('p').innerHTML = title
    }

    constructor() {
        super('template--table__th')
    }
}
