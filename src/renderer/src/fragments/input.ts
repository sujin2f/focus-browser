import { A_FormElement } from './abs-form-element'

export class Input extends A_FormElement<HTMLLabelElement> {
    constructor(label: string) {
        super('input', label)
    }
}
