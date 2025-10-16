import { A_Page } from '@home/modules/pages/abs_page'

import { Element } from '@home/modules/fragments'
import { Heading } from '@home/modules/fragments/heading'
import { Button } from '@home/modules/fragments/button'

import { ipcRenderer } from '@home/util'
import { Channel, PageType, SceneBrowser } from '@src/types'

export class Offline extends A_Page {
    public page = PageType.OFFLINE

    render(): void {
        this.root.innerHTML = ''
        const title = new Heading(
            1,
            { className: ['text-center'] },
            'No internet',
        )
        const reload = new Button(
            {
                onClick: () => {
                    ipcRenderer.send(
                        Channel.SWITCH,
                        SceneBrowser.BROWSER,
                        'reload',
                    )
                },
            },
            'Refresh',
        )
        // Container
        const container = new Element<HTMLDivElement>(
            'div',
            {
                className: [
                    'flex',
                    'flex-col',
                    'h-dvh',
                    'justify-center',
                    'items-center',
                ],
            },
            title,
            reload,
        )
        this.root.append(container.element)
    }

    cbInfoUpdated() {
        this.render()
    }
}
