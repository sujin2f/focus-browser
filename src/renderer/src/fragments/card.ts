import { A_Fragment } from './abs-fragment'

export class Card extends A_Fragment<HTMLAnchorElement> {
    constructor(title: string, description?: string) {
        super('#card')
        this.node.querySelector('h2')!.textContent = title
        if (description) {
            this.node.querySelector('p')!.textContent = description
        } else {
            this.node.querySelector('p')!.remove()
        }
    }

    public setOnClick(callback: () => void) {
        this.element.addEventListener('click', callback.bind(this))
    }
}
