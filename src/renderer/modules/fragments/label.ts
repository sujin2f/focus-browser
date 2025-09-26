import { ElementProps } from '@src/types'
import { Element } from '.'

export default class Label extends Element<HTMLLabelElement> {
    public set title(title: string) {
        this.p.innerHTML = title
    }

    private p = new Element<HTMLParagraphElement>('p')

    constructor(
        props: Partial<ElementProps> = {},
        ...children: (string | Element<HTMLElement>)[]
    ) {
        super('label', props)
        this.p.classList.add(
            'inline-block',
            'text-md',
            'font-light',
            'text-gray-700',
            'mb-0.5',
            'pl-3',
            'dark:text-gray-300',
        )
        this.append(this.p, ...children)
    }
}
