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

    public append(parent: HTMLElement | Element) {
        if (this.node) {
            parent.append(this.node)
            this._element = parent.lastElementChild! as T
        }
        return this
    }

    public prepend(parent: HTMLElement) {
        if (this.node) {
            parent.prepend(this.node)
            this._element = parent.firstElementChild! as T
        }
        return this
    }
}
