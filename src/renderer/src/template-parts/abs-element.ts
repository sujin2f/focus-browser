import { getSection } from '@src/renderer/src/utils'

export abstract class A_Element<T extends HTMLElement> {
    private _element?: T
    public get element(): T {
        if (!this._element || !this._element.textContent) {
            // TODO IPC
            throw new Error('Cannot find _element')
        }
        return this._element
    }

    constructor(selector: string) {
        const template = document.querySelector<HTMLTemplateElement>(selector)
        if (!template) {
            // TODO IPC
            throw new Error('Cannot find template')
        }
        this._element = template.content.cloneNode(true) as T
    }

    /**
     * @param parent HTML Element or #id
     * @returns
     */
    public appendTo(parent: Element | string) {
        const dest = typeof parent === 'string' ? getSection(parent) : parent
        dest.append(this._element as Element)
        this._element = dest.lastElementChild! as T
        return this
    }

    /**
     * @param parent HTML Element or #id
     * @returns
     */
    public prependTo(parent: Element | string) {
        const dest = typeof parent === 'string' ? getSection(parent) : parent
        dest.prepend(this._element as Element)
        this._element = dest.lastElementChild! as T
        return this
    }

    protected select<R extends HTMLElement>(selector: string): R {
        return this.element.querySelector(`[data-selector="${selector}"]`) as R
    }

    public show() {
        this.element.classList.remove('hidden')
    }

    public hide() {
        this.element.classList.add('hidden')
    }
}
