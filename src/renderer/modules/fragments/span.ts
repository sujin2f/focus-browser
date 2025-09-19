import { A_HTMLFragmentWithEvent } from '.'

export default class Span extends A_HTMLFragmentWithEvent<HTMLSpanElement> {
    protected get template() {
        return document.createElement('span')
    }

    constructor() {
        super('')
    }
}
