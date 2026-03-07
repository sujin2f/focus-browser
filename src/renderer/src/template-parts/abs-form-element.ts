import { A_Element } from './abs-element'

export abstract class A_FormElement<
    T extends HTMLElement,
> extends A_Element<T> {
    public get input() {
        const element = this.select<HTMLInputElement | HTMLSelectElement>(
            'input',
        )
        if (!element) {
            throw new Error('input is not defined')
        }
        return element
    }

    public set helpText(helpText: string) {
        const element = this.select<HTMLParagraphElement>('help-text')
        if (!element) {
            throw new Error('help-text is not defined')
        }
        element.innerHTML = helpText
    }

    public getHelpText() {
        const element = this.select<HTMLParagraphElement>('help-text')
        if (!element) {
            throw new Error('help-text is not defined')
        }
        return element
    }

    public set error(message: string) {
        const element = this.select<HTMLParagraphElement>('error-message')
        if (!element) {
            throw new Error('error-message is not defined')
        }
        element.innerHTML = message
        if (message) {
            element.classList.remove('hidden')
        } else {
            element.classList.add('hidden')
        }
    }

    public get value(): string {
        return this.input.value || ''
    }

    public set value(value: string | number | undefined | null) {
        this.input.value = value?.toString() || ''
    }

    public set name(name: string) {
        this.input.name = name
    }

    constructor(
        tagName: string,
        private _label: string,
        private _name: string,
    ) {
        super(`#${tagName}`)
    }

    protected afterAppend() {
        this.element.querySelector('[data-selector="label"]')!.textContent =
            this._label
        this.element
            .querySelector('[data-selector="input"]')!
            .setAttribute('name', this._name)
        super.afterAppend()
    }

    /**
     * @deprecated
     */
    public setOnInput(callback: ((e: Event) => void) | (() => void)) {
        this.input.addEventListener('input', callback.bind(this))
        return this
    }

    /**
     * @deprecated
     */
    public setOnChange(callback: (e: Event) => void) {
        this.input.addEventListener('change', callback.bind(this))
        return this
    }

    /**
     * @deprecated
     */
    public setOnKeyUp(callback: (e: KeyboardEvent) => void) {
        ;(this.input as HTMLInputElement).addEventListener(
            'keyup',
            callback.bind(this),
        )
        return this
    }

    public focus() {
        this.input.focus()
        return this
    }

    public blur() {
        this.input.blur()
        return this
    }
}
