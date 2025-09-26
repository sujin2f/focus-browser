import { ElementProps } from '@src/types'
import { Element } from '.'
import Heading from './heading'

export default class Card extends Element<HTMLAnchorElement> {
    public set title(title: string) {
        this.h2.innerHTML = title
    }

    public set description(description: string) {
        this.p.innerHTML = description
    }

    private h2: Heading = new Heading(2)
    private p: Element<HTMLParagraphElement> = new Element('p')

    public constructor(props: Partial<ElementProps> = {}) {
        super('a', props)
        this.element.classList.add(
            'p-3',
            'm-3',
            'border',
            'border-gray-300',
            'dark:border-transparent',
            'rounded-sm',
            'bg-white',
            'dark:bg-gray-900',
            'hover:bg-gray-100',
            'dark:hover:bg-gray-800',
            'cursor-pointer',
            'hover',
        )
        this.element.role = 'button'

        this.h2.classList.add(
            'pb-1',
            'mb-1',
            'text-lg',
            'font-bold',
            'text-gray-600',
            'dark:text-gray-200',
        )
        this.p.classList.add('text-gray-500', 'dark:text-gray-400')

        this.append(this.h2)
        this.append(this.p)
    }
}
