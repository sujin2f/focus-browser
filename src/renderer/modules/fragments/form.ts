import { Element } from '.'
import type { ElementProps } from '@src/types'

type Props = {
    onSubmit: (ev: HTMLElementEventMap['submit']) => unknown
}

export class Form extends Element<HTMLFormElement> {
    public constructor({
        className = [],
        ...props
    }: Partial<ElementProps<null> & Props> = {}) {
        super({
            tag: 'form',
            ...props,
            className: [...className, 'max-w-2xl', 'm-auto', 'p-3'],
        })

        if (props.onSubmit) {
            this.addEventListener('submit', props.onSubmit)
        }
    }
}
