import { ElementProps } from '@src/types'
import { Element } from '.'

type Props = {
    title: string
}

export default class Label extends Element<HTMLLabelElement> {
    public set title(title: string) {
        this.p.innerHTML = title
    }

    private p = new Element<HTMLParagraphElement>('p')

    constructor(
        props: Partial<ElementProps & Props> = {},
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
        if (props.title) {
            this.title = props.title
        }
    }
}
