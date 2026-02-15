import { Element } from '@src/renderer/src/modules/fragments'

import { Button } from '@src/renderer/src/modules/fragments/button'

import { ipcRenderer, SwitchEvent } from '@src/renderer/src/utils'
import type { ElementProps } from '@src/common/types'
import {
    IPC_CHANNELS,
    CENTRE_PAGES,
    RequestHandler,
} from '@src/common/constants'

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
                ipcRenderer.send(IPC_CHANNELS.INFO, RequestHandler.MODIFY, {
                    helpText: false,
                })
                document.dispatchEvent(new SwitchEvent(CENTRE_PAGES.RELOAD))
            },
        }).append('Hide Tip')
        this.wrapper = new Element({ tag: 'div' })
        this.element.append(this.wrapper.element, this.button.element)
    }
}
