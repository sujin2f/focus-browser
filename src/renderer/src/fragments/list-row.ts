import { A_Fragment } from './abs-fragment'

export class ListRow extends A_Fragment<HTMLButtonElement> {
    constructor(
        title: string,
        description?: string,
        prefix?: A_Fragment<HTMLElement>,
        suffix?: A_Fragment<HTMLElement>,
    ) {
        super('#list-row')

        this.node.querySelector('h3')!.textContent = title
        if (description) {
            this.node.querySelector('p')!.textContent = description
        } else {
            this.node.querySelector('p')!.remove()
        }

        if (prefix) {
            prefix.append(this.node.querySelector('[data-selector="prefix"]')!)
        }

        if (suffix) {
            suffix.append(this.node.querySelector('[data-selector="suffix"]')!)
        }
    }

    public setOnClick(callback: ((e: PointerEvent) => void) | (() => void)) {
        this.element.addEventListener('click', callback.bind(this))
    }
}
