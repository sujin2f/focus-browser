import type { ElementProps } from '@src/types'

export class Element<T extends HTMLElement> {
    /**
     * Element
     */
    private _element: T
    protected set element(element: T) {
        this._element = element
    }
    public get element(): T {
        return this._element
    }
    private _children: (string | Element<HTMLElement>)[] = []

    constructor(
        private tag: string,
        private props: Partial<ElementProps> = {},
        ...children: (string | Element<HTMLElement>)[]
    ) {
        this._children = children
        this.constInit()
    }

    private constInit() {
        const { className, hide, onClick } = this.props
        this.element = document.createElement(this.tag) as T
        this.append(...this._children)

        if (className) {
            const clsSet = new Set<string>()

            className.forEach((cls) => {
                if (cls.startsWith('-')) {
                    clsSet.delete(cls.slice(1))
                    return
                }
                clsSet.add(cls)
            })

            this.classList.add(...clsSet.values())
        }

        if (hide) {
            this.hide()
        }

        if (onClick) {
            this.addEventListener('click', onClick.bind(this))
        }
    }

    /**
     * Data
     */
    private _data: Record<string, unknown> = {}
    public setData<D>(key: string, value: D) {
        this._data[key] = value
    }
    public getData(key: string) {
        return this._data[key]
    }

    public get classList() {
        return this.element.classList
    }

    public set innerHTML(html: string) {
        this.element.innerHTML = html
    }

    /**
     * Show/Hide
     */
    public show() {
        this.element.classList.remove('hidden')
    }
    public hide() {
        this.element.classList.add('hidden')
    }
    public get hidden() {
        return this.element.classList.contains('hidden')
    }

    /**
     * Events
     */
    public addEventListener<K extends keyof HTMLElementEventMap>(
        type: K,
        listener: (this: T, ev: HTMLElementEventMap[K]) => unknown,
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
        listener: (this: T, ev: HTMLElementEventMap[K]) => unknown,
        options?: boolean | AddEventListenerOptions,
    ): void {
        this.element.removeEventListener(
            type,
            listener as EventListenerOrEventListenerObject,
            options,
        )
    }

    public append(...children: (string | Element<HTMLElement>)[]) {
        this.element.append(
            ...children.map((child) =>
                typeof child === 'string' ? child : child.element,
            ),
        )
    }

    public prepend(...children: (string | Element<HTMLElement>)[]) {
        this.element.prepend(
            ...children.map((child) =>
                typeof child === 'string' ? child : child.element,
            ),
        )
    }

    public destroy() {
        this.element.remove()
    }

    public reset() {
        this.constInit()
    }
}
