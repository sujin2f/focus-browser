import { A_Fragment } from './abs-fragment'

export class Modal extends A_Fragment<HTMLElement> {
    constructor() {
        super('#modal')
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
}
