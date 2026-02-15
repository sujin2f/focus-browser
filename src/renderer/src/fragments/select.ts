import { A_FormElement } from './abs-form-element'

/**
 * <select />
 */
export class Select extends A_FormElement<HTMLLabelElement> {
    constructor(label: string) {
        super('select', label)
    }
}
