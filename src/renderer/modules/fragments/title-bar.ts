import { Element } from '.'
import { ipcRenderer } from '@home/util'
import { Channel, RequestHandler } from '@src/constants'

import type { Info } from '@src/types'

export class TitleBar extends Element<HTMLFormElement> {
    public constructor(root: HTMLElement) {
        super({
            tag: 'div',
            className: [
                'fixed',
                'w-full',
                'bg-gray-900',
                'text-gray-50',
                'top-0',
                'left-0',
                'pt-2',
                'pb-2',
                'flex',
                'justify-center',
            ],
        })

        const maximize = new Element({
            tag: 'div',
            className: ['cursor-pointer'],
        })
            .append('Double Click to Maximize')
            .addEventListener('dblclick', function () {
                ipcRenderer.send(Channel.INFO, RequestHandler.MODIFY, {
                    maximize: true,
                } satisfies Partial<Info>)
            })
        const separator = new Element({
            tag: 'div',
            className: ['ml-3', 'mr-3'],
        }).append('|')
        const drag = new Element({ tag: 'div', className: ['cursor-pointer'] })
            .append('Move Window')
            .setAttribute('style', '-webkit-app-region:drag')
        this.append(maximize, separator, drag)

        root.append(this.element)
        root.classList.add('pt-5')
    }
}
