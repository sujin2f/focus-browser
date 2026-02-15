import { A_Page } from '@src/renderer/src/modules/pages/abs_page'

import { Element } from '@src/renderer/src/modules/fragments'
import { Heading } from '@src/renderer/src/modules/fragments/heading'
import { Button } from '@src/renderer/src/modules/fragments/button'

import { ipcRenderer } from '@src/renderer/src/utils'
import { IPC_CHANNELS, PageType, BROWSER } from '@src/common/constants'

export class Offline extends A_Page {
    public page = PageType.OFFLINE

    constructor() {
        super()
        this.requestInfo('frame')
    }

    refresh(): void {
        this.root.reset(this.settings.frame)

        const title = new Heading(1, { className: ['text-center'] }).append(
            'No internet',
        )
        const reload = new Button({
            onClick: () => {
                ipcRenderer.send(IPC_CHANNELS.SWITCH, BROWSER, 'reload')
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
