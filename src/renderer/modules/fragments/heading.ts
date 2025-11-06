import { Element } from '.'
import type { ElementProps } from '@src/types'

export class Heading extends Element<HTMLHeadingElement> {
    constructor(
        level: 1 | 2 | 3 | 4 | 5 | 6,
        { className = [], ...props }: Partial<ElementProps<null>> = {},
    ) {
        const mb = 7 - level
        const size = 5 - level < 2 ? '' : 5 - level
        super({
            tag: `h${level}`,
            className: [
                'font-bold',
                `text-${size}xl`,
                `mb-${mb}`,
                ...className,
            ],
            ...props,
        })
    }
}
