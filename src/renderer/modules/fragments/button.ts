import { Element } from '@home/modules/fragments'
import type { ElementProps } from '@src/types'

type ButtonTypes = 'submit' | 'reset' | 'button'
type Props = {
    type: ButtonTypes
}
export class Button extends Element<HTMLButtonElement> {
    public set type(type: ButtonTypes) {
        this.element.type = type
    }

    constructor({
        className = [],
        type = 'button',
        ...props
    }: Partial<ElementProps<null> & Props> = {}) {
        super({
            tag: 'button',
            hide: props.hide,
            onClick: props.onClick,
            className: [
                'mb-3',
                'p-2',
                'rounded-sm',
                'text-sm',
                'font-medium',
                'text-white',
                'bg-pink-900',
                'hover',
                'hover:bg-pink-700',
                'focus:outline-none',
                'focus:ring-2',
                'focus:ring-pink-500',
                'cursor-pointer',
                ...className,
            ],
        })

        this.element.type = type
    }
}
