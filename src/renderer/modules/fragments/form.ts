import { ElementProps } from '@src/types'
import { Element } from '.'

type Props = {
    onSubmit: (ev: HTMLElementEventMap['submit']) => unknown
}

export class Form extends Element<HTMLFormElement> {
    public constructor(
        { className = [], ...props }: Partial<ElementProps & Props> = {},
        ...children: (string | Element<HTMLElement>)[]
    ) {
        super(
            'form',
            {
                ...props,
                className: [...className, 'max-w-2xl', 'm-auto', 'p-3'],
            },
            ...children,
        )

        if (props.onSubmit) {
            this.addEventListener('submit', props.onSubmit)
        }
    }
}
