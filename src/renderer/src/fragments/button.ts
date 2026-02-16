import { A_Fragment } from './abs-fragment'

export class Button extends A_Fragment<HTMLButtonElement> {
    public set type(type: 'submit' | 'reset') {
        this.element.type = type
    }

    constructor(title: string, selector: string = 'button') {
        super(`#${selector}`)
        this.node.querySelector('button')!.textContent = title
    }

    public setOnClick(callback: ((e: PointerEvent) => void) | (() => void)) {
        this.element.addEventListener('click', callback.bind(this))
        return this
    }

    public disable() {
        this.element.disabled = true
    }

    public enable() {
        this.element.disabled = false
    }
}
