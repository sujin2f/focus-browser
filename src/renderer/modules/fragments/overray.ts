import HTMLFragment from '.'

export default class Overlay extends HTMLFragment<HTMLDivElement> {
    public appendChild(element: HTMLElement) {
        this.element.appendChild(element)
    }

    constructor() {
        super('template--overlay')
    }
}
