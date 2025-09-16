import { A_HTMLFragmentWithEvent } from '.'

export default class Card extends A_HTMLFragmentWithEvent<HTMLAnchorElement> {
    public set title(title: string) {
        this.element.querySelector('h2').innerHTML = title
    }

    public set description(description: string) {
        this.element.querySelector('p').innerHTML = description
    }

    public constructor() {
        super('template--card')
    }
}
