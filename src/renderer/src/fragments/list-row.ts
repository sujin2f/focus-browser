import { A_Fragment } from './abs-fragment'

export class ListRow extends A_Fragment<HTMLButtonElement> {
    constructor(title: string, description?: string) {
        super('#list-row')

        this.node.querySelector('h3')!.textContent = title
        if (description) {
            this.node.querySelector('p')!.textContent = description
        } else {
            this.node.querySelector('p')!.remove()
        }
    }

    public setOnClick(callback: ((e: PointerEvent) => void) | (() => void)) {
        this.element.addEventListener('click', callback.bind(this))
        return this
    }

    public get prefix() {
        const prefix = this.select('prefix')
        if (!prefix) {
            throw new Error('prefix is not defined')
        }
        return prefix
    }

    public get suffix() {
        const suffix = this.select('suffix')
        if (!suffix) {
            throw new Error('suffix is not defined')
        }
        return suffix
    }
}
