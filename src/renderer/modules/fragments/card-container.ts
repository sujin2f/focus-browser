import { Element } from '.'

export default class CardContainer extends Element<HTMLElement> {
    public constructor() {
        super('section', {
            className: [
                'grid',
                'grid-cols-1',
                'sm:grid-cols-2',
                'md:grid-cols-3',
                'lg:grid-cols-4',
                'mt-2',
            ],
        })
    }
}
