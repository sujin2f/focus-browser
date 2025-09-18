import { A_HTMLFragmentWithEvent } from '.'

export default class Form extends A_HTMLFragmentWithEvent<HTMLFormElement> {
    public constructor() {
        super('template--form')
    }
}
