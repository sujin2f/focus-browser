import { A_Element } from './abs-element'

export class ListRow extends A_Element<HTMLDivElement> {
    public get button() {
        const button = this.select('button')
        if (!button) {
            throw new Error('button is not defined')
        }
        return button
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

    public get children() {
        const children = this.select('children')
        if (!children) {
            throw new Error('children is not defined')
        }
        return children
    }

    constructor(title: string, description?: string) {
        super('#list-row')

        this.element.querySelector('h3')!.textContent = title
        if (description) {
            this.element.querySelector('p')!.textContent = description
        } else {
            this.element.querySelector('p')!.remove()
        }
    }

    public setOnClick(callback: ((e: PointerEvent) => void) | (() => void)) {
        this.button.addEventListener('click', callback.bind(this))
        return this
    }
}
