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

    constructor(title: string, description?: string) {
        super('#card')
        this.element.querySelector('h2')!.textContent = title
        if (description) {
            this.element.querySelector('p')!.textContent = description
        }
    }

    public setOnClick(callback: () => void) {
        this.element.addEventListener('click', callback.bind(this))
        return this
    }
}
