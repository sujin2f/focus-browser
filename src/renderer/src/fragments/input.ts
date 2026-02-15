import { A_FormElement } from './abs-form-element'

export class Input extends A_FormElement<HTMLLabelElement> {
    public set type(type: string) {
        ;(this.input as HTMLInputElement).type = type
    }

    constructor(label: string) {
        super('input', label)
    }
}
