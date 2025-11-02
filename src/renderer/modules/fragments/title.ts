import { Element } from '.'
import type { ElementProps } from '@src/types'
import { Heading } from '@home/modules/fragments/heading'
import { navigate } from '@home/util'
import { Button } from './button'

type Props = {
    label?: string
}

export class Title extends Element<HTMLElement> {
    private title?: Heading
    private button: Button

    public constructor({
        label = '',
        ...props
    }: Partial<ElementProps<null> & Props> = {}) {
        super({
            tag: 'section',
            className: ['flex', 'items-center'],
            ...props,
        })

        this.label = label
        this.button = new Button({ onClick: () => navigate() }).append(
            'Back to Browser',
        )
        this.append(this.button)
    }

    public set label(label: string) {
        if (!label && this.title) {
            this.title = null
            return
        }
        if (label && this.title) {
            this.title.innerHTML = label
            return
        }
        if (label && !this.title) {
            this.title = new Heading(1, {
                className: ['mr-2'],
            }).append(label)
            this.prepend(this.title)
            return
        }
    }
}
