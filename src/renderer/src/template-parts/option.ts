import { A_Fragment } from './abs-fragment'

/**
 * <select />
 */
export class Option extends A_Fragment<HTMLOptionElement> {
    constructor(label: string, value: string, selected: boolean = false) {
        super('#option')
        const option = this.node.querySelector('option')!
        option.textContent = label
        option.value = value
        option.selected = selected
    }
}
