import { A_Element } from './abs-element'

/**
 * <select />
 */
export class Option extends A_Element<HTMLOptionElement> {
    constructor(label: string, value: string, selected: boolean = false) {
        super('#option')
        const option = this.element.querySelector('option')!
        option.textContent = label
        option.value = value
        option.selected = selected
    }
}
