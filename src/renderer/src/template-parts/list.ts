import { A_Element } from './abs-element'
/* Utils */
import { getSection } from '@home/utils'

export class List extends A_Element<HTMLElement> {
    public get element(): HTMLElement {
        return getSection('list')
    }

    constructor(css: string = '') {
        super()
        if (css) {
            this.element.classList.add(css)
        }
    }

    public appendTo(_: Element | string) {
        throw new Error('Cannot call appendTo for List')
        return this
    }
    public prependTo(_: Element | string) {
        throw new Error('Cannot call prependTo for List')
        return this
    }
}
