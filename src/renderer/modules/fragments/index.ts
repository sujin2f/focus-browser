import type { ElementProps } from '@src/types'

/**
 * HTML elements, similar with React, for Tailwind
 * This project aims lightweight browser. Do not use huge library.
 */
export class Element<
    T extends HTMLElement,
    D extends Record<string, unknown> = null,
> {
    /**
     * Elements: main & children
     */
    private _element: T
    protected set element(element: T) {
        this._element = element
    }
    public get element(): T {
        return this._element
    }
    private _children: (string | Element<HTMLElement, null>)[] = []

    constructor(private props: Partial<ElementProps<D>> = {}) {
        this.init()
    }

    private init() {
        const {
            tag = 'div',
            className,
            hide,
            value,
            onClick,
            selector,
            props,
        } = this.props

        // query element or create one
        if (selector) {
            this.element = document.querySelector(selector) as T
            if (!this.element) {
                throw new Error()
            }
        } else {
            this.element = document.createElement(tag) as T
        }

        // reset
        this._children = []
        this.element.innerHTML = ''

        if (value) {
            this.element.setAttribute('value', value || '')
        }

        if (className) {
            const items = new Set<string>()

            className.forEach((cls) => {
                if (cls.startsWith('-')) {
                    items.delete(cls.slice(1))
                    return
                }
                items.add(cls)
            })

            this.classList.add(...items.values())
        }

        if (hide) {
            this.hide()
        }

        if (onClick) {
            this.addEventListener('click', onClick.bind(this))
        }

        if (props) {
            this._data = props
        }
    }

    /**
     * Data
     */
    private _data: D = {} as D
    public setData<K extends keyof D>(key: K, value: D[K]) {
        this._data[key] = value
    }
    public getData<K extends keyof D>(key: K): D[K] {
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

    public append(...children: (string | Element<HTMLElement>)[]): this {
        this._children.push(...children)
        this.element.append(
            ...children.map((child) =>
                typeof child === 'string' ? child : child.element,
            ),
        )
        return this
    }

    public prepend(...children: (string | Element<HTMLElement>)[]): this {
        this._children.unshift(...children)
        this.element.prepend(
            ...children.map((child) =>
                typeof child === 'string' ? child : child.element,
            ),
        )
        return this
    }

    public destroy() {
        this.element.remove()
    }

    public reset() {
        this.init()
    }
}
