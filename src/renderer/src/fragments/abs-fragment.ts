import { getSection } from '@src/renderer/src/utils'

export abstract class A_Fragment<T extends HTMLElement> {
    protected node: T
    private _element?: T
    public get element(): T {
        if (!this._element) {
            // TODO IPC
            throw new Error('Cannot find _element')
        }
        return this._element
    }

    constructor(selector: string) {
        const template = document.querySelector<HTMLTemplateElement>(selector)
        if (!template) {
            // TODO IPC
            throw new Error('Cannot find _element')
        }
        this.node = template?.content.cloneNode(true) as T
    }

    /**
     * @param parent HTML Element or #id
     * @returns
     */
    public appendTo(parent: HTMLElement | Element | string) {
        if (this.node) {
            const dest =
                typeof parent === 'string' ? getSection(parent) : parent
            dest.append(this.node)
            this._element = dest.lastElementChild! as T
        }
        return this
    }

    /**
     * @param parent HTML Element or #id
     * @returns
     */
    public prependTo(parent: HTMLElement | Element | string) {
        if (this.node) {
            const dest =
                typeof parent === 'string' ? getSection(parent) : parent
            dest.prepend(this.node)
            this._element = dest.firstElementChild! as T
        }
        return this
    }

    protected select<R extends HTMLElement>(selector: string): R {
        return this.element.querySelector(`[data-selector="${selector}"]`) as R
    }
}
