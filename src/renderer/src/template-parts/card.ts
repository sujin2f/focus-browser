import { A_Element } from './abs-element'

export class Card extends A_Element<HTMLAnchorElement> {
    public set description(description: string | HTMLElement) {
        const paragraph = this.element.querySelector('p')
        if (!paragraph) {
            return
        }
        paragraph.innerHTML = ''
        paragraph.append(description)
    }

    public get description() {
        return this.element.querySelector('p')! as HTMLParagraphElement
    }

    constructor(
        private _title: string,
        private _description?: string,
    ) {
        super('#card')
    }

    protected init() {
        this.element.querySelector('h2')!.textContent = this._title
        if (this._description) {
            this.element.querySelector('p')!.textContent = this._description
        }
    }

    public setOnClick(callback: () => void) {
        this.element.addEventListener('click', callback.bind(this))
        return this
    }
}
