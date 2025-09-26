import { ElementProps } from '@src/types'
import { Element } from '.'

export default class Button extends Element<HTMLButtonElement> {
    public set type(type: 'submit' | 'reset' | 'button') {
        this.element.type = type
    }

    constructor(
        { className = [], hide, onClick }: Partial<ElementProps> = {},
        ...children: (string | Element<HTMLElement>)[]
    ) {
        super(
            'button',
            {
                hide,
                onClick,
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
            },
            ...children,
        )
        this.element.type = 'button'
    }
}
