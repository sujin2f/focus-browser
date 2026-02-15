import { A_Fragment } from './abs-fragment'

export abstract class A_FormElement<
    T extends HTMLElement,
> extends A_Fragment<T> {
    public get input() {
        const element = this.element.querySelector<
            HTMLInputElement | HTMLSelectElement
        >('[data-selector="input"]')
        if (!element) {
            throw new Error('input is not defined')
        }
        return element
    }

    public set helpText(helpText: string) {
        const element = this.element.querySelector<HTMLParagraphElement>(
            '[data-selector="help-text"]',
        )
        if (!element) {
            throw new Error('help-text is not defined')
        }
        element.innerHTML = helpText
    }

    public set error(message: string) {
        const element = this.element.querySelector<HTMLParagraphElement>(
            '[data-selector="error-message"]',
        )
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

    public get value() {
        return this.input.value
    }

    public set value(value: string) {
        this.input.value = value
    }

    constructor(tagName: string, label: string) {
        super(`#${tagName}`)
        this.node.querySelector('[data-selector="label"]')!.textContent = label
    }

    public setOnInput(callback: ((e: Event) => void) | (() => void)) {
        this.input.addEventListener('input', callback.bind(this))
        return this
    }

    public setOnChange(callback: (e: Event) => void) {
        this.input.addEventListener('change', callback.bind(this))
        return this
    }

    public setOnEnter(callback: (e: KeyboardEvent) => void) {
        ;(this.input as HTMLInputElement).addEventListener(
            'keydown',
            callback.bind(this),
        )
        return this
    }

    public focus() {
        this.input.focus()
        return this
    }
}
