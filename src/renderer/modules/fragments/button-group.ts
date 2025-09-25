import type { ElementProps } from '@src/types'
import { Element } from '.'
import type Button from './button'

export default class ButtonGroup extends Element<HTMLDivElement> {
    constructor(props: Partial<ElementProps> = {}, ...children: Button[]) {
        super('div', props)
        this.element.classList.add('flex', 'justify-between')
        this.append(...children)
    }

    public append(...children: Button[]) {
        this.element.append(
            ...children.map((child) => {
                child.classList.add('mr-2', 'last:mr-0')
                return child.element
            }),
        )
    }

    public prepend(...children: Button[]) {
        this.element.prepend(
            ...children.map((child) => {
                child.classList.add('mr-2', 'last:mr-0')
                return child.element
            }),
        )
    }
}
