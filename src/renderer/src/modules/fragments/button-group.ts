import { Element } from '@src/renderer/src/modules/fragments'
import type { Button } from '@src/renderer/src/modules/fragments/button'
import type { ElementProps } from '@src/common/types'

export class ButtonGroup extends Element<HTMLElement> {
    constructor(props: Partial<ElementProps<null>> = {}) {
        super({ tag: 'section', ...props })
        this.className('flex', 'justify-between')
    }

    public append(...children: Button[]): this {
        this.element.append(
            ...children.map((child) => {
                child.className('mr-2', 'last:mr-0')
                return child.element
            }),
        )
        return this
    }

    public prepend(...children: Button[]): this {
        this.element.prepend(
            ...children.map((child) => {
                child.className('mr-2', 'last:mr-0')
                return child.element
            }),
        )
        return this
    }
}
