import { A_Element } from './abs-element'

export class H1 extends A_Element<HTMLHeadingElement> {
    constructor(protected title: string) {
        super('#h1')
    }

    protected afterAppend() {
        this.element.textContent = this.title
    }
}
