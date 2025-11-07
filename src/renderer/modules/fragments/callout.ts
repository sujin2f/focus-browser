import { Element } from '@home/modules/fragments'

import { Button } from '@home/modules/fragments/button'

import { ipcRenderer } from '@home/utils'
import type { ElementProps } from '@src/common/types'
import { Channel, RequestHandler, TableAction } from '@src/common/constants'

export class Callout extends Element<HTMLDivElement> {
    private button: Button
    private wrapper: Element<HTMLDivElement>

    constructor(props: Partial<ElementProps<null>> = {}) {
        super({ tag: 'div', ...props })
        this.className(
            'p-3',
            'w-full',
            'border',
            'border-transparent',
            'bg-zinc-100',
            'dark:bg-zinc-800',
            'rounded-md',
            'flex',
            'flex-col',
            'mr-auto',
            'ml-auto',
        )

        this.button = new Button({
            className: ['mb-3'],
            onClick: (e) => {
                e.preventDefault()
                ipcRenderer.send(Channel.INFO, RequestHandler.MODIFY, {
                    helpText: false,
                })
                window.controller.setting.helpText = false
                window.controller.currentPage.action(TableAction.INFO)
            },
        }).append('Hide Tip')
        this.wrapper = new Element({ tag: 'div' })
        this.element.append(this.wrapper.element, this.button.element)
    }
}
