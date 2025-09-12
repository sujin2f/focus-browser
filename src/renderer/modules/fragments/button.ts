import { A_HTMLFragmentWithEvent } from '.'

export default class Button extends A_HTMLFragmentWithEvent<HTMLButtonElement> {
    public set text(text: string) {
        this.element.innerHTML = text
    }

    public set className(className: string) {
        this.element.className = className
    }

    public set type(type: 'submit' | 'reset' | 'button') {
        this.element.type = type
    }

    constructor() {
        super('template--button')
    }
}
