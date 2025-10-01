import { A_Page } from '@home/modules/pages/abs_page'

import { Element } from '@home/modules/fragments'
import Heading from '@home/modules/fragments/heading'
import Controller from '@home/modules/controller'
import Input from '@home/modules/fragments/input'
import Card from '@home/modules/fragments/card'
import Label from '@home/modules/fragments/label'
import CardContainer from '@home/modules/fragments/card-container'
import Callout from '@home/modules/fragments/callout'

import { ipcRenderer, isMac, navigate, shortcutToHtml } from '@home/util'
import { Channel, PageType, RequestHandler } from '@src/types'

export class Setting extends A_Page {
    public page = PageType.SETTING

    constructor() {
        super()
    }

    render(): void {
        this.root.innerHTML = ''
        const wrapper = new Element('section', {
            className: ['w-4/6', 'mx-auto'],
        })
        this.root.append(wrapper.element)

        const title: Heading = new Heading(1, {}, 'Setting')
        wrapper.append(title)

        const helpText = new Input({
            type: 'checkbox',
            checked: Controller.getInstance().setting.helpText,
            onChange: () => {
                ipcRenderer.send(Channel.INFO, RequestHandler.MODIFY, {
                    helpText: helpText.checked,
                })
                Controller.getInstance().setting.helpText = helpText.checked
            },
        })
        wrapper.append(
            new Label(
                { title: 'Show Help Text', className: ['block', 'mb-2'] },
                helpText,
            ),
        )

        const maxHistory = new Input({
            type: 'number',
            value: Controller.getInstance().setting.maxHistory.toString(),
            onChange: () => {
                ipcRenderer.send(Channel.INFO, RequestHandler.MODIFY, {
                    maxHistory: parseInt(maxHistory.value),
                })
                Controller.getInstance().setting.maxHistory = parseInt(
                    maxHistory.value,
                )
            },
        })
        wrapper.append(
            new Label(
                { title: 'Maximum History', className: ['block', 'mb-2'] },
                maxHistory,
            ),
        )
    }

    cbInfoUpdated() {
        this.render()
    }

    doShortcut(e: KeyboardEvent): boolean {
        return super.doShortcut(e)
    }
}
