import { A_Page } from '@home/modules/pages/abs_page'
import { Controller } from '@home/modules/controller'

import { Element } from '@home/modules/fragments'
import { Heading } from '@home/modules/fragments/heading'
import { Button } from '@home/modules/fragments/button'
import { TitleBar } from '@home/modules/fragments/title-bar'

import { ipcRenderer } from '@home/util'
import { Channel, PageType, BROWSER } from '@src/constants'

export class Offline extends A_Page {
    public page = PageType.OFFLINE

    refresh(): void {
        this.root.innerHTML = ''

        if (!Controller.getInstance().setting.frame) {
            new TitleBar(this.root)
        }

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
        this.root.append(container.element)
    }
}
