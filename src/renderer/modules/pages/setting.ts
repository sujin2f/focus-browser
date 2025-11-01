import { A_Page } from '@home/modules/pages/abs_page'

import { Element } from '@home/modules/fragments'
import { Heading } from '@home/modules/fragments/heading'
import { Controller } from '@home/modules/controller'
import { Input } from '@home/modules/fragments/input'

import { ipcRenderer, navigate } from '@home/util'
import type { Info } from '@src/types'
import { Channel, PageType, RequestHandler, SearchEngine } from '@src/constants'
import { Select } from '../fragments/select'

export class Setting extends A_Page {
    public page = PageType.SETTING

    constructor() {
        super()
        ipcRenderer.send(Channel.INFO, RequestHandler.REQUEST)
    }

    private get title() {
        return new Heading(1, { onClick: () => navigate() }).append('Setting')
    }

    private get helpText() {
        const helpText = new Input({
            type: 'checkbox',
            checked: Controller.getInstance().setting.helpText,
            onChange: () => {
                ipcRenderer.send(Channel.INFO, RequestHandler.MODIFY, {
                    helpText: helpText.checked,
                } satisfies Partial<Info>)
                Controller.getInstance().setting.helpText = helpText.checked
            },
            label: 'Show Help Text',
        })
        return helpText
    }

    private get maxHistory() {
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
                } satisfies Partial<Info>)
                Controller.getInstance().setting.maxHistory = value
            },
            label: 'Maximum History',
        })
        return maxHistory
    }

    private get adBlocker() {
        const adBlocker = new Input({
            type: 'checkbox',
            checked: Controller.getInstance().setting.adBlocker,
            onChange: () => {
                ipcRenderer.send(Channel.INFO, RequestHandler.MODIFY, {
                    adBlocker: adBlocker.checked,
                } satisfies Partial<Info>)
                Controller.getInstance().setting.adBlocker = adBlocker.checked
            },
            label: 'Use Ad-Blocker',
        })
        return adBlocker
    }

    private get adBlockerStatus() {
        return new Element({
            tag: 'div',
            onClick: () => {
                if (Controller.getInstance().setting.adBlockerStatus !== null) {
                    return
                }
                ipcRenderer.send(Channel.INFO, RequestHandler.MODIFY, {
                    adBlockerStatus: true,
                } satisfies Partial<Info>)
            },
            className: ['cursor-pointer'],
        }).append(
            `Ad-Blocker Status: ${(() => {
                if (Controller.getInstance().setting.adBlockerStatus === null) {
                    return 'Failed to load. Click here to retry.'
                }
                if (
                    Controller.getInstance().setting.adBlockerStatus === false
                ) {
                    return 'Disabled'
                }

                return 'Working!'
            })()}`,
        )
    }

    private get cacheSize() {
        let cacheSize = Controller.getInstance().setting.cacheSize
        let cacheText = ''
        const mb = 1024 * 1024
        if (cacheSize < mb) {
            cacheText = `${cacheSize} bytes`
        } else if (cacheSize < mb * 1024) {
            cacheSize = cacheSize / mb
            cacheText = `${cacheSize.toFixed(2)} Mb`
        } else {
            cacheSize = cacheSize / (mb * 1024)
            cacheText = `${cacheSize.toFixed(2)} Gb`
        }
        return new Element({
            tag: 'div',
            onClick: () => {
                ipcRenderer.send(Channel.INFO, RequestHandler.MODIFY, {
                    cacheSize: NaN,
                } satisfies Partial<Info>)
            },
            className: ['cursor-pointer'],
        }).append(`Cache size: ${cacheText} (Click to clear)`)
    }

    private get searchEngine() {
        const searchEngine = new Select({
            label: 'Search Engine',
            onChange: () => {
                ipcRenderer.send(Channel.INFO, RequestHandler.MODIFY, {
                    searchEngine: searchEngine.value,
                } satisfies Partial<Info>)
            },
            options: SearchEngine,
        })
        return searchEngine
    }

    refresh() {
        this.root.innerHTML = ''
        const wrapper = new Element({
            tag: 'section',
            className: ['w-4/6', 'mx-auto'],
        })

        this.root.append(wrapper.element)
        wrapper.append(
            this.title,
            this.helpText,
            this.maxHistory,
            this.adBlocker,
            this.adBlockerStatus,
            this.searchEngine,
            this.cacheSize,
        )
    }
}
