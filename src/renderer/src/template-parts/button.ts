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

    protected init() {
        this.element.textContent = this._title

        if (this.onClickCallback) {
            this.setOnClick(this.onClickCallback)
        }
    }

    private onClickCallback?: ((e: PointerEvent) => void) | (() => void)
    public setOnClick(callback: ((e: PointerEvent) => void) | (() => void)) {
        try {
            this.element.addEventListener('click', callback.bind(this))
        } catch {
            this.onClickCallback = callback
        }
        return this
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
