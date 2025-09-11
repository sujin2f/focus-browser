export default class HTMLFragment<T extends HTMLElement> {
    private _element: T

    protected set element(element: T) {
        this._element = element
    }

    public get element(): T {
        return this._element
    }

    public get hidden() {
        return this.element.classList.contains('hidden')
    }

    protected get template() {
        const template = document.getElementById(
            this.templateId,
        ) as HTMLTemplateElement
        const node = template.content.cloneNode(true) as DocumentFragment
        return node.firstElementChild as T
    }

    protected constructor(private templateId: string) {
        this.element = this.template
    }

    public show() {
        this.element.classList.remove('hidden')
    }
    public hide() {
        this.element.classList.add('hidden')
    }
}
