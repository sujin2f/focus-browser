import { A_Page } from '@home/modules/pages/abs_page'

import { Element } from '@home/modules/fragments'
import { Heading } from '@home/modules/fragments/heading'
import { Button } from '@home/modules/fragments/button'

import { ipcRenderer } from '@home/utils'
import { Channel, PageType, BROWSER } from '@src/common/constants'

export class Offline extends A_Page {
    public page = PageType.OFFLINE

    refresh(): void {
        this.root.reset()

        const title = new Heading(1, { className: ['text-center'] }).append(
            'No internet',
        )
        const reload = new Button({
            onClick: () => {
                ipcRenderer.send(Channel.SWITCH, BROWSER, 'reload')
            },
        }).append('Refresh')
        // Container
        const container = new Element<HTMLDivElement>({
            tag: 'div',
            className: [
                'flex',
                'flex-col',
                'h-dvh',
                'justify-center',
                'items-center',
            ],
        }).append(title, reload)
        this.root.append(container)
    }
}
