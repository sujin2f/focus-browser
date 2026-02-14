import type { ElementProps } from '@src/common/types'

/**
 * HTML elements, similar with React, for Tailwind
 * This project aims lightweight browser. Do not use huge library.
 */
export class Element<T extends HTMLElement> {
    /**
     * Elements: main & children
     */
    private _element!: T // Assigning from init()
    protected set element(element: T) {
        this._element = element
    }
    public get element(): T {
        return this._element
    }
    private _children: (string | Element<HTMLElement>)[] = []

    constructor(private props: Partial<ElementProps<null>> = {}) {
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
                if (!cls) {
                    return
                }
                items.add(cls)
            })

            this.className(...items.values())
        }

        if (hide) {
            this.hide()
        }

        if (onClick) {
            this.addEventListener('click', onClick.bind(this))
        }
    }

    public set innerHTML(html: string) {
        this.element.innerHTML = html
    }

    /**
     * Show/Hide
     */
    public show() {
        this.className('-hidden')
    }
    public hide() {
        this.className('hidden')
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
    ): this {
        this.element.addEventListener(
            type,
            listener as EventListenerOrEventListenerObject,
            options,
        )
        return this
    }

    public removeEventListener<K extends keyof HTMLElementEventMap>(
        type: K,
        listener: (this: T, ev: HTMLElementEventMap[K]) => unknown,
        options?: boolean | AddEventListenerOptions,
    ): this {
        this.element.removeEventListener(
            type,
            listener as EventListenerOrEventListenerObject,
            options,
        )
        return this
    }

    public setAttribute(qualifiedName: string, value: string): this {
        this.element.setAttribute(qualifiedName, value)
        return this
    }

    public getAttribute(qualifiedName: string): string | null {
        return this.element.getAttribute(qualifiedName)
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

    public className(...className: string[]) {
        className.forEach((cls) => {
            if (cls.startsWith('-')) {
                this.element.classList.remove(cls.slice(1))
                return
            }
            if (!cls) {
                return
            }
            this.element.classList.add(cls)
        })
    }

    public destroy() {
        this.element.remove()
    }

    public reset(..._: unknown[]): this {
        this.init()
        return this
    }
}

/**
 * HTML elements, similar with React, for Tailwind
 * This project aims lightweight browser. Do not use huge library.
 */
export class ElementWithData<
    T extends HTMLElement,
    D extends Record<string, unknown>,
> extends Element<T> {
    constructor(private propsWithData: Partial<ElementProps<D>> = {}) {
        super(propsWithData as unknown as ElementProps<null>)

        if (propsWithData.props) {
            this._data = propsWithData.props
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

    public set innerHTML(html: string) {
        this.element.innerHTML = html
    }
}
