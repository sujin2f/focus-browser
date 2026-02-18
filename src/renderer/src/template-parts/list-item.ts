import { A_Element } from './abs-element'

export class ListItem extends A_Element<HTMLDivElement> {
    public set title(title: string) {
        this.element.querySelector('h3')!.textContent = title
    }

    constructor(title: string, description?: string) {
        super('#list-item')

        this.element.querySelector('h3')!.textContent = title
        if (description) {
            this.element.querySelector('p')!.textContent = description
        } else {
            this.element.querySelector('p')!.remove()
        }
    }

    public setOnClick(callback: ((e: PointerEvent) => void) | (() => void)) {
        this.element.addEventListener('click', callback.bind(this))
        return this
    }
}
