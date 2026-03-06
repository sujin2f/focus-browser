import { A_Element } from './abs-element'
import { Button } from './button'

export class ListItem extends Button {
    public get title(): HTMLHeadingElement {
        return this.element.querySelector('h3')!
    }

    public set title(title: string | A_Element<HTMLElement> | HTMLElement) {
        if (!this.element) {
            this._title = title
            return
        }

        this.title.innerHTML = ''

        if (typeof title === 'string') {
            this.title.textContent = title
        } else if (title instanceof A_Element) {
            title.appendTo(this.title)
        } else if (title) {
            this.title.append(title)
        }
    }

    constructor(
        protected _title?: string | A_Element<HTMLElement> | HTMLElement,
        private _description?: string,
    ) {
        super(_title, 'list-item')
    }

    protected afterAppend() {
        if (this._title) this.title = this._title

        if (this._description) {
            this.element.querySelector('p')!.textContent = this._description
        } else {
            this.element.querySelector('p')!.remove()
        }

        this._title = undefined
        super.afterAppend()
    }
}
