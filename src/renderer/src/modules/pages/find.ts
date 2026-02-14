import { A_Page } from '@src/renderer/src/modules/pages/abs_page'

import { Element } from '@src/renderer/src/modules/fragments'
import { Input } from '@src/renderer/src/modules/fragments/input'

import { Channel, PageType, RequestHandler } from '@src/common/constants'
import { ipcRenderer, navigate } from '@src/renderer/src/utils'

export class Find extends A_Page {
    public page = PageType.FIND

    constructor() {
        super()
        this.requestInfo('findText', 'frame')
    }

    private get container() {
        return new Element<HTMLDivElement>({
            tag: 'div',
            className: [
                'flex',
                'flex-col',
                'h-dvh',
                'justify-center',
                'items-center',
            ],
        })
    }

    private get field() {
        return new Input({
            value: this.settings.findText || '',
            label: 'Find in Page',
        })
    }

    refresh(): void {
        this.root.reset(this.settings.frame)

        const field = this.field
        const container = this.container.append(field)
        this.root.append(container)
        field.input.element.select()

        field.addEventListener('keydown', (e) => {
            if (e.code === 'Enter') {
                ipcRenderer.send(
                    Channel.FIND,
                    RequestHandler.REQUEST,
                    field.value,
                )
                navigate()
            }
        })
    }
}
