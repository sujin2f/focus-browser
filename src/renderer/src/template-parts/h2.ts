import { A_Fragment } from './abs-fragment'

export class H2 extends A_Fragment<HTMLHeadingElement> {
    constructor(title: string) {
        super('#h2')
        this.node.querySelector('h2')!.textContent = title
    }
}
