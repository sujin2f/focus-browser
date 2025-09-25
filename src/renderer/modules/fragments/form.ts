import { Element } from '.'

export default class Form extends Element<HTMLFormElement> {
    public constructor() {
        super('form')
        this.element.classList.add('max-w-2xl', 'm-auto', 'p-3')
    }
}
