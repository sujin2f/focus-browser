import HTMLFragment from '.'

export default class Card extends HTMLFragment<HTMLAnchorElement> {
    public set title(title: string) {
        this.element.querySelector('h2').innerHTML = title
    }

    public set description(description: string) {
        this.element.querySelector('p').innerHTML = description
    }

    public addEventListener<K extends keyof HTMLElementEventMap>(
        type: K,
        listener: (this: HTMLAnchorElement, ev: HTMLElementEventMap[K]) => any,
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
        listener: (this: HTMLAnchorElement, ev: HTMLElementEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions,
    ): void {
        this.element.removeEventListener(
            type,
            listener as EventListenerOrEventListenerObject,
            options,
        )
    }

    public constructor() {
        super('template--card')
    }
}
