import { A_HTMLFragment } from '.'

export default class Label extends A_HTMLFragment<HTMLLabelElement> {
    public set title(title: string) {
        this.element.querySelector('span').innerHTML = title
    }

    public constructor() {
        super('template--label')
    }
}
