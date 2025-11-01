import { ElementProps } from '@src/types'
import { Element } from '.'

export class TrLinked extends Element<HTMLTableRowElement> {
    prev?: TrLinked
    next?: TrLinked

    public constructor(
        { className = [], ...props }: Partial<ElementProps> = {},
        ...children: (string | Element<HTMLElement>)[]
    ) {
        super(
            'tr',
            {
                ...props,
                className: [
                    ...className,
                    'hover',
                    'cursor-pointer',
                    'text-sm',
                    'antialiased',
                    'font-normal',
                    'leading-normal',
                    'text-blue-gray-900',
                    'border-l-5',
                    'border-transparent',
                ],
            },
            ...children,
        )
    }
}
