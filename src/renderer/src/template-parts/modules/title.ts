import { H1 } from '@home/template-parts/h1'
import { ButtonBack } from '@src/renderer/src/template-parts/modules/button-back'

export class Title extends H1 {
    constructor(protected title: string) {
        super('#h1')
        this.prependTo('title')
        new ButtonBack().prependTo(this.element)
    }
}
