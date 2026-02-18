import { A_Element } from './abs-element'

export class Button extends A_Element<HTMLButtonElement> {
    public set type(type: 'submit' | 'reset') {
        this.element.type = type
    }

    constructor(title: string, selector: string = 'button') {
        super(`#${selector}`)
        this.element.querySelector('button')!.textContent = title
    }

    public setOnClick(callback: ((e: PointerEvent) => void) | (() => void)) {
        this.element.addEventListener('click', callback.bind(this))
        return this
    }

    public disable() {
        this.element.classList.remove('hover')
        this.element.classList.add('opacity-40')
        this.element.disabled = true
    }

    public enable() {
        this.element.classList.add('hover')
        this.element.classList.remove('opacity-40')
        this.element.disabled = false
    }
}
