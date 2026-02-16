import { A_FormElement } from './abs-form-element'

export class Checkbox extends A_FormElement<HTMLLabelElement> {
    public set checked(checked: boolean) {
        ;(this.input as HTMLInputElement).checked = checked
    }

    public get checked() {
        return (this.input as HTMLInputElement).checked
    }

    constructor(label: string, name: string) {
        super('checkbox', label, name)
    }
}
