import { A_Element } from './abs-element'

export class H1 extends A_Element<HTMLHeadingElement> {
    constructor(protected title: string) {
        super('#h1')
    }

    protected init() {
        this.element.textContent = this.title
    }
}
