import HTMLFragment from '.'

export default class Button extends HTMLFragment<HTMLButtonElement> {
    public set title(title: string) {
        this.element.innerHTML = title
    }

    public set className(className: string) {
        this.element.className = className
    }

    public set type(type: 'submit' | 'reset' | 'button') {
        this.element.type = type
    }

    public addEventListener<K extends keyof HTMLElementEventMap>(
        type: K,
        listener: (this: HTMLButtonElement, ev: HTMLElementEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions,
    ): void {
        this.element.addEventListener(
            type,
            listener as EventListenerOrEventListenerObject,
            options,
        )
    }

    public removeEventListener<K extends keyof HTMLElementEventMap>(
        type: K,
        listener: (this: HTMLButtonElement, ev: HTMLElementEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions,
    ): void {
        this.element.removeEventListener(
            type,
            listener as EventListenerOrEventListenerObject,
            options,
        )
    }

    constructor() {
        super('template--button')
    }
}
