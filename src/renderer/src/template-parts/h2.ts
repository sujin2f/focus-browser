import { A_Element } from './abs-element'

export class H2 extends A_Element<HTMLHeadingElement> {
    constructor(title: string) {
        super('#h2')
        this.element.querySelector('h2')!.textContent = title
    }
}
