import { A_HTMLFragmentWithEvent } from '.'

export default class Input extends A_HTMLFragmentWithEvent<HTMLInputElement> {
    public set type(type: string) {
        this.element.setAttribute('type', type)
    }

    public set placeholder(placeholder: string) {
        this.element.setAttribute('placeholder', placeholder)
    }

    public set className(className: string) {
        this.element.setAttribute('class', className)
    }

    public set maxLength(maxLength: number) {
        this.element.maxLength = maxLength
    }

    public set value(value: string) {
        this.element.value = value
    }

    public get value() {
        return this.element.value
    }

    public focus() {
        this.element.focus()
    }

    public blur() {
        this.element.blur()
    }

    public constructor() {
        super('template--input')
    }
}
