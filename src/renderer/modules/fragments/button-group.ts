import { Element } from '@home/modules/fragments'
import type { Button } from '@home/modules/fragments/button'
import type { ElementProps } from '@src/common/types'

export class ButtonGroup extends Element<HTMLElement> {
    constructor(props: Partial<ElementProps<null>> = {}) {
        super({ tag: 'section', ...props })
        this.element.classList.add('flex', 'justify-between')
    }

    public append(...children: Button[]): this {
        this.element.append(
            ...children.map((child) => {
                child.classList.add('mr-2', 'last:mr-0')
                return child.element
            }),
        )
        return this
    }

    public prepend(...children: Button[]): this {
        this.element.prepend(
            ...children.map((child) => {
                child.classList.add('mr-2', 'last:mr-0')
                return child.element
            }),
        )
        return this
    }
}
