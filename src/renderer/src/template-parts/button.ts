import { A_Element } from './abs-element'

export class Button extends A_Element<HTMLButtonElement> {
    public set type(type: 'submit' | 'reset') {
        this.element.type = type
    }

    public set title(title: string | A_Element<HTMLElement> | HTMLElement) {
        if (!this.element) {
            this._title = title
            return
        }
        if (typeof title === 'string') {
            this.element.textContent = title
        } else if (title instanceof A_Element) {
            title.appendTo(this.element)
        } else if (title) {
            this.element.append(title)
        }
    }

    constructor(
        protected _title?: string | A_Element<HTMLElement> | HTMLElement,
        selector: string = 'button',
    ) {
        super(`#${selector}`)
    }

    protected afterAppend() {
        if (this._title) this.title = this._title
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
