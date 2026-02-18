import { A_Element } from './abs-element'

export class H1 extends A_Element<HTMLHeadingElement> {
    constructor(title: string) {
        super('#h1')
        this.element.querySelector('h1')!.textContent = title
    }
}
