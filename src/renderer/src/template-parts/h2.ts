import { A_Element } from './abs-element'

export class H2 extends A_Element<HTMLHeadingElement> {
    constructor(private title: string) {
        super('#h2')
    }

    protected afterAppend() {
        this.element.textContent = this.title
        super.afterAppend()
    }
}
