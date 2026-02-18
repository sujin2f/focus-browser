import { A_Fragment } from './abs-fragment'

export class Card extends A_Fragment<HTMLAnchorElement> {
    public set description(description: string | HTMLElement) {
        const paragraph = this.element.querySelector('p')
        if (!paragraph) {
            return
        }
        paragraph.innerHTML = ''
        paragraph.append(description)
    }

    constructor(title: string, description?: string) {
        super('#card')
        this.node.querySelector('h2')!.textContent = title
        if (description) {
            this.node.querySelector('p')!.textContent = description
        }
    }

    public setOnClick(callback: () => void) {
        this.element.addEventListener('click', callback.bind(this))
        return this
    }
}
