import { A_Element } from '../abs-element'
/* Utils */
import { navigate } from '@src/renderer/src/utils'

export class ButtonBack extends A_Element<HTMLButtonElement> {
    constructor() {
        super('#back-button')
    }

    protected init() {
        this.element.addEventListener('click', () => {
            navigate({})
        })
    }
}
