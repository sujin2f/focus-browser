import { Element } from '@home/modules/fragments'
import { Controller } from '@home/modules/controller'

import { Button } from '@home/modules/fragments/button'

import { ipcRenderer } from '@home/util'
import type { ElementProps } from '@src/types'
import { Channel, RequestHandler, TableAction } from '@src/constants'

export class Callout extends Element<HTMLDivElement> {
    private button: Button
    private wrapper: Element<HTMLDivElement>

    constructor(props: Partial<ElementProps<null>> = {}) {
        super({ tag: 'div', ...props })
        this.element.classList.add(
            'p-3',
            'w-full',
            'border',
            'border-transparent',
            'bg-zinc-800',
            'rounded-md',
            'text-center',
        )

        this.button = new Button({
            className: ['mt-3', '-mb-3'],
            onClick: (e) => {
                e.preventDefault()
                ipcRenderer.send(Channel.INFO, RequestHandler.MODIFY, {
                    helpText: false,
                })
                Controller.getInstance().setting.helpText = false
                Controller.getInstance().currentPage.action(TableAction.INFO)
            },
        }).append('Hide Tip')
        this.wrapper = new Element({ tag: 'div' })
        this.element.append(this.wrapper.element, this.button.element)
    }
}
