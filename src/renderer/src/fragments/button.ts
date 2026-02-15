import { A_Fragment } from './abs-fragment'

export class Button extends A_Fragment<HTMLButtonElement> {
    constructor(title: string, selector: string = 'button') {
        super(`#${selector}`)
        this.node.querySelector('button')!.textContent = title
    }

    public setOnClick(callback: ((e: PointerEvent) => void) | (() => void)) {
        this.element.addEventListener('click', callback.bind(this))
        return this
    }
}
