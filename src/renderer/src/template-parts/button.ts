import { A_Element } from './abs-element'

export class Button extends A_Element<HTMLButtonElement> {
    public set type(type: 'submit' | 'reset') {
        this.element.type = type
    }

    constructor(
        protected _title: string,
        selector: string = 'button',
    ) {
        super(`#${selector}`)
    }

    protected afterAppend() {
        this.element.textContent = this._title
        super.afterAppend()
    }

    public disable() {
        this.element.classList.remove('hover')
        this.element.classList.add('opacity-40')
        this.element.disabled = true
        return this
    }

    public enable() {
        this.element.classList.add('hover')
        this.element.classList.remove('opacity-40')
        this.element.disabled = false
        return this
    }
}
