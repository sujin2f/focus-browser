import { A_Element } from './abs-element'

export class Modal extends A_Element<HTMLElement> {
    constructor() {
        super('#modal')
    }

    protected afterAppend() {
        this.select('close').addEventListener('click', () => this.hide())
    }

    public show() {
        this.element.classList.remove('hidden')
        this.element.classList.add('flex')
        return this
    }

    public hide() {
        this.element.classList.add('hidden')
        this.element.classList.remove('flex')
        return this
    }

    public get activated() {
        return this.element.classList.contains('flex')
    }

    public get content() {
        return this.select('content')
    }
}
