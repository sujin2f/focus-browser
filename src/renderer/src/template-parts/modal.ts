import { A_Element } from './abs-element'

export class Modal extends A_Element<HTMLElement> {
    constructor() {
        super('#modal')
    }

    protected init() {
        this.element
            .querySelector('[data-selector="close"]')!
            .addEventListener('click', this.hide.bind(this))
    }

    public show() {
        this.element.classList.remove('hidden')
        this.element.classList.add('flex')
    }

    public hide() {
        this.element.classList.add('hidden')
        this.element.classList.remove('flex')
    }

    public get activated() {
        return this.element.classList.contains('flex')
    }

    public get content() {
        return this.select('content')
    }
}
