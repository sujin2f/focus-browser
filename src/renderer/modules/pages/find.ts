import { A_Page } from '@home/modules/pages/abs_page'

import { Element } from '@home/modules/fragments'
import { Input } from '@home/modules/fragments/input'

import { Channel, PageType, RequestHandler } from '@src/common/constants'
import { ipcRenderer, navigate } from '@home/utils'

export class Find extends A_Page {
    public page = PageType.FIND

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
            value: window.controller.setting.findText || '',
            label: 'Find in Page',
        })
    }

    refresh(): void {
        this.root.reset()

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
