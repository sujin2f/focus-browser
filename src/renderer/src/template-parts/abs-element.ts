/* Utils */
import { getSection } from '@src/renderer/src/utils'
/* Models */
import { Logger } from '@src/renderer/src/utils/logger'

export abstract class A_Element<T extends HTMLElement> {
    private node?: Node
    protected _element?: T
    public get element(): T {
        if (!this._element) {
            Logger.getInstance().error(`Cannot find _element ${this.selector}`)
            return null as unknown as T // it will trigger an error anyway
        }
        return this._element
    }

    constructor(private selector: string = '') {
        if (!selector) {
            return
        }
        const template = document.querySelector<HTMLTemplateElement>(selector)
        if (!template) {
            throw new Error(`Cannot find template ${selector}`)
        }
        this.node = template.content.cloneNode(true) as T
    }

    protected afterAppend() {}

    /**
     * @param parent HTML Element or #id
     * @returns
     */
    public appendTo(parent: Element | string) {
        if (!this.node) {
            throw new Error('Cannot find node')
        }
        const dest = typeof parent === 'string' ? getSection(parent) : parent
        dest.append(this.node)
        this._element = dest.lastElementChild! as T
        this.afterAppend()
        return this
    }

    /**
     * @param parent HTML Element or #id
     * @returns
     */
    public prependTo(parent: Element | string) {
        if (!this.node) {
            throw new Error('Cannot find node')
        }
        const dest = typeof parent === 'string' ? getSection(parent) : parent
        dest.prepend(this.node)
        this._element = dest.firstElementChild! as T
        this.afterAppend()
        return this
    }

    /**
     * @param parent HTML Element or #id
     * @returns
     */
    public after(parent: Element | string) {
        const dest = typeof parent === 'string' ? getSection(parent) : parent
        document.body.append(this._element as Element)
        this._element = document.body.lastElementChild! as T
        this._element = dest.insertAdjacentElement(
            'afterend',
            this._element,
        ) as T
        return this
    }

    protected select<R extends HTMLElement>(selector: string): R {
        return this.element.querySelector(`[data-selector="${selector}"]`) as R
    }

    public show() {
        this.element.classList.remove('hidden')
        return this
    }

    public hide() {
        this.element.classList.add('hidden')
        return this
    }

    public isHidden() {
        return this.element.classList.contains('hidden')
    }

    public addClass(...classes: string[]) {
        this.element.classList.add(...classes)
        return this
    }
}
