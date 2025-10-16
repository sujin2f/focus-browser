import { A_Page } from '@home/modules/pages/abs_page'

import { Element } from '@home/modules/fragments'
import { Heading } from '@home/modules/fragments/heading'
import { Controller } from '@home/modules/controller'
import { Input } from '@home/modules/fragments/input'

import { ipcRenderer } from '@home/util'
import { Channel, PageType, RequestHandler } from '@src/types'

export class Setting extends A_Page {
    public page = PageType.SETTING

    render(): void {
        this.root.innerHTML = ''
        const wrapper = new Element('section', {
            className: ['w-4/6', 'mx-auto'],
        })

        const title: Heading = new Heading(1, {}, 'Setting')

        const helpText = new Input({
            type: 'checkbox',
            checked: Controller.getInstance().setting.helpText,
            onChange: () => {
                ipcRenderer.send(Channel.INFO, RequestHandler.MODIFY, {
                    helpText: helpText.checked,
                })
                Controller.getInstance().setting.helpText = helpText.checked
            },
            label: 'Show Help Text',
        })

        const maxHistory = new Input({
            type: 'number',
            value: Controller.getInstance().setting.maxHistory.toString(),
            onChange: () => {
                maxHistory.error = ''
                const value = parseInt(maxHistory.value)
                if (value < 10) {
                    maxHistory.error = 'This value must be bigger than 9.'
                    return
                }
                ipcRenderer.send(Channel.INFO, RequestHandler.MODIFY, {
                    maxHistory: value,
                })
                Controller.getInstance().setting.maxHistory = value
            },
            label: 'Maximum History',
        })

        const adBlocker = new Input({
            type: 'checkbox',
            checked: Controller.getInstance().setting.adBlocker,
            onChange: () => {
                ipcRenderer.send(Channel.INFO, RequestHandler.MODIFY, {
                    adBlocker: adBlocker.checked,
                })
                Controller.getInstance().setting.adBlocker = adBlocker.checked
            },
            label: 'Use Ad-Blocker',
        })

        this.root.append(wrapper.element)
        wrapper.append(title, helpText, maxHistory, adBlocker)
    }

    cbInfoUpdated() {
        this.render()
    }
}
