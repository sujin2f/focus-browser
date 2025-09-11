import HTMLFragment from '.'

export default class Input extends HTMLFragment<HTMLLabelElement> {
    public set label(label: string) {
        this.element.querySelector('span').innerHTML = label
    }

    public set type(type: string) {
        this.element.querySelector('input').setAttribute('type', type)
    }

    public set placeholder(placeholder: string) {
        this.element
            .querySelector('input')
            .setAttribute('placeholder', placeholder)
    }

    public set className(className: string) {
        this.input.setAttribute('class', className)
    }

    public get input() {
        return this.element.querySelector('input')
    }

    public set value(value: string) {
        this.input.value = value
    }

    public get value() {
        return this.input.value
    }

    public focus() {
        this.input.focus()
    }

    public blur() {
        this.input.blur()
    }

    public addEventListener<K extends keyof HTMLElementEventMap>(
        type: K,
        listener: (this: HTMLInputElement, ev: HTMLElementEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions,
    ): void {
        this.input.addEventListener(
            type,
            listener as EventListenerOrEventListenerObject,
            options,
        )
    }

    public removeEventListener<K extends keyof HTMLElementEventMap>(
        type: K,
        listener: (this: HTMLInputElement, ev: HTMLElementEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions,
    ): void {
        this.input.removeEventListener(
            type,
            listener as EventListenerOrEventListenerObject,
            options,
        )
    }

    public constructor() {
        super('template--input')
    }
}
