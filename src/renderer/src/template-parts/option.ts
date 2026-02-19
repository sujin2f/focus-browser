import { A_Element } from './abs-element'

/**
 * <select />
 */
export class Option extends A_Element<HTMLOptionElement> {
    constructor(
        private label: string,
        private value: string,
        private selected: boolean = false,
    ) {
        super('#option')
    }

    protected init() {
        this.element.textContent = this.label
        this.element.value = this.value
        this.element.selected = this.selected
    }
}
