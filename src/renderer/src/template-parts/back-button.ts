import { A_Element } from './abs-element'
/* Utils */
import { navigate } from '@home/utils'

export class BackButton extends A_Element<HTMLButtonElement> {
    constructor() {
        super('#back-button')
    }

    protected init() {
        this.element.addEventListener('click', () => {
            navigate({})
        })
    }
}
