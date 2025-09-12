import { A_HTMLFragment } from '.'

export default class Overlay extends A_HTMLFragment<HTMLDivElement> {
    public appendChild(element: HTMLElement) {
        this.element.appendChild(element)
    }

    constructor() {
        super('template--overlay')
    }
}
