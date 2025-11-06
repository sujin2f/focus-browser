import { Element } from '.'
import type { ElementProps } from '@src/types'

export class TrLinked<D extends Record<string, unknown>> extends Element<
    HTMLTableRowElement,
    D
> {
    prev?: TrLinked<D>
    next?: TrLinked<D>

    public constructor({
        className = [],
        ...props
    }: Partial<ElementProps<D>> = {}) {
        super({
            ...props,
            tag: 'tr',
            className: [
                'hover',
                'cursor-pointer',
                'text-sm',
                'antialiased',
                'font-normal',
                'leading-normal',
                'text-blue-gray-900',
                'border-l-5',
                'border-transparent',
                ...className,
            ],
            props: {} as D,
        })
    }
}
