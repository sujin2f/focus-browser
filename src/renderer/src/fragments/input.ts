import { A_Fragment } from './abs-fragment'

export class Input extends A_Fragment<HTMLLabelElement> {
    constructor(title: string) {
        super('#input')
        this.node.querySelector('[data-selector="label"]')!.textContent = title
    }

    public setOnEnter(callback: (e: KeyboardEvent) => void) {
        const input = this.element.querySelector('input')
        if (!input) {
            throw new Error('Input is not defined')
        }
        input.addEventListener('keydown', callback.bind(this))
    }

    public get input() {
        const input = this.element.querySelector('input')
        if (!input) {
            throw new Error('Input is not defined')
        }
        return input
    }
}
