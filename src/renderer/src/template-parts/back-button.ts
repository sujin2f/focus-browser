import { A_Fragment } from './abs-fragment'
/* Utils */
import { navigate } from '@src/renderer/src/utils'

export class BackButton extends A_Fragment<HTMLButtonElement> {
    constructor() {
        super('#back-button')

        const button = this.node.querySelector('button')
        if (button) {
            button.addEventListener('click', () => {
                navigate()
            })
        }
    }
}
