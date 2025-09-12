/**
 * Base class for HTML Template
 */
export abstract class A_HTMLFragment<T extends HTMLElement> {
    /**
     * The templateId will capture <template /> and put the clone in this.element
     * @param {string} templateId
     * @param {string} childWrapperQuerySelector If not set, use the root element
     */
    protected constructor(
        private templateId: string,
        private childWrapperQuerySelector?: string,
    ) {
        this.element = this.template
    }

    protected get template() {
        const template = document.getElementById(
            this.templateId,
        ) as HTMLTemplateElement
        if (!template) {
            throw new Error(`Template id ${this.templateId} does not exist.`)
        }
        const node = template.content.cloneNode(true) as DocumentFragment
        return node.firstElementChild as T
    }

    private _element: T
    protected set element(element: T) {
        this._element = element
    }
    public get element(): T {
        return this._element
    }

    /**
     * For children fragments
     */
    private _children: A_HTMLFragment<HTMLElement>[] = []

    protected get childWrapper() {
        if (!this.childWrapperQuerySelector) {
            return this.element
        }

        const wrapper = this.element.querySelector(
            this.childWrapperQuerySelector,
        )
        if (!wrapper) {
            throw new Error(
                `The element for query selector ${this.childWrapperQuerySelector} does not exist.`,
            )
        }
        return wrapper
    }

    public set child(child: A_HTMLFragment<HTMLElement>) {
        this._children.push(child)
        this.childWrapper.appendChild(child.element)
    }

    public get children() {
        return this._children
    }

    public set innerHTML(html: string) {
        this._children.forEach((child) => child.reset())
        this._children = []
        this.childWrapper.innerHTML = html
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
     * Reset
     */
    public reset() {
        this.element.remove()
        this._children.forEach((child) => child.reset())
        this._children = []
        this.element = this.template
    }
}

export abstract class A_HTMLFragmentWithEvent<
    T extends HTMLElement,
> extends A_HTMLFragment<T> {
    public addEventListener<K extends keyof HTMLElementEventMap>(
        type: K,
        listener: (this: T, ev: HTMLElementEventMap[K]) => any,
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
        listener: (this: T, ev: HTMLElementEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions,
    ): void {
        this.element.removeEventListener(
            type,
            listener as EventListenerOrEventListenerObject,
            options,
        )
    }
}
