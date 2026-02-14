import { Element } from '.'
import { ipcRenderer } from '@src/renderer/src/utils'
import { Channel, RequestHandler } from '@src/common/constants'

import type { Info } from '@src/common/types'

export class TitleBar extends Element<HTMLFormElement> {
    public constructor(root: Element<HTMLElement>) {
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
                'grid',
                'grid-cols-2',
            ],
        })

        const maximize = new Element({
            tag: 'div',
            className: ['cursor-pointer', 'text-right'],
        })
            .append('Double Click to Maximize |')
            .addEventListener('dblclick', function () {
                ipcRenderer.send(Channel.INFO, RequestHandler.MODIFY, {
                    maximize: true,
                } satisfies Partial<Info>)
            })
        const drag = new Element({
            tag: 'div',
            className: ['cursor-pointer', 'pl-1'],
        })
            .append('Move Window')
            .setAttribute('style', '-webkit-app-region:drag')

        this.append(maximize, drag)

        root.append(this)
        root.className('pt-5')
    }
}
