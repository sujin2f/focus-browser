import { Element } from '.'
import type { ElementProps } from '@src/types'

export class Heading extends Element<HTMLHeadingElement> {
    constructor(
        level: 1 | 2 | 3 | 4 | 5 | 6,
        props: Partial<ElementProps<null>> = {},
    ) {
        super({ tag: `h${level}`, ...props })

        const mb = 7 - level
        const size = 6 - level < 2 ? '' : 6 - level
        this.element.classList.add('font-bold', `text-${size}xl`, `mb-${mb}`)
    }
}
