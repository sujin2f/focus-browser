import { A_Fragment } from './abs-fragment'

export class H1 extends A_Fragment<HTMLHeadingElement> {
    constructor(title: string) {
        super('#h1')
        this.node.querySelector('h1')!.textContent = title
    }
}
