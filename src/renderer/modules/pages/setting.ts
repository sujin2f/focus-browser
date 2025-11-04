import { A_Page } from '@home/modules/pages/abs_page'
import { Controller } from '@home/modules/controller'

import { Element } from '@home/modules/fragments'
import { Input } from '@home/modules/fragments/input'
import { Title } from '@home/modules/fragments/title'
import { Select } from '@home/modules/fragments/select'
import { Button } from '@home/modules/fragments/button'
import { TitleBar } from '@home/modules/fragments/title-bar'

import { ipcRenderer, isMac } from '@home/util'
import type { Info } from '@src/types'
import { Channel, PageType, RequestHandler, SearchEngine } from '@src/constants'

export class Setting extends A_Page {
    public page = PageType.SETTING

    constructor() {
        super()
        ipcRenderer.send(Channel.INFO, RequestHandler.REQUEST)
    }

    private get title() {
        return new Title({ label: 'Setting' })
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
                if (!value || value < 10) {
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
            className: [
                'pl-3',
                'mb-4',
                'text-md',
                'font-light',
                'flex',
                'items-center',
            ],
        }).append(
            new Element({
                tag: 'div',
                className: ['text-gray-700', 'dark:text-gray-300', 'mr-3'],
            }).append('Ad-Blocker Status'),
            new Element({
                tag: 'div',
                className: ['mr-3'],
            }).append(
                (() => {
                    if (
                        Controller.getInstance().setting.adBlockerStatus ===
                        null
                    ) {
                        return 'Failed to load. Click here to retry.'
                    }
                    if (
                        Controller.getInstance().setting.adBlockerStatus ===
                        false
                    ) {
                        return 'Disabled'
                    }

                    return 'Working!'
                })(),
            ),
            Controller.getInstance().setting.adBlockerStatus === null
                ? new Button({
                      className: ['-mb-3'],
                      onClick: () => {
                          ipcRenderer.send(
                              Channel.INFO,
                              RequestHandler.MODIFY,
                              {
                                  adBlockerStatus: true,
                              } satisfies Partial<Info>,
                          )
                      },
                  }).append('Reset')
                : '',
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
            className: [
                'pl-3',
                'mb-4',
                'text-md',
                'font-light',
                'flex',
                'items-center',
            ],
        }).append(
            new Element({
                tag: 'div',
                className: ['text-gray-700', 'dark:text-gray-300', 'mr-3'],
            }).append('Cache size'),
            new Element({
                tag: 'div',
                className: ['mr-3'],
            }).append(cacheText),
            new Button({
                className: ['-mb-3'],
                onClick: () => {
                    ipcRenderer.send(Channel.INFO, RequestHandler.MODIFY, {
                        cacheSize: NaN,
                    } satisfies Partial<Info>)
                },
            }).append('Clear Cache'),
        )
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

    private get frame() {
        const shortcut = isMac() ? '⌘' : 'Ctrl+'
        const frame = new Input({
            type: 'checkbox',
            checked: Controller.getInstance().setting.frame,
            onChange: () => {
                ipcRenderer.send(Channel.INFO, RequestHandler.MODIFY, {
                    frame: frame.checked,
                } satisfies Partial<Info>)
                Controller.getInstance().setting.frame = frame.checked
            },
            label: 'Show Native Frame',
            helpText: `Note: This requires restarting the application. You can toggle window fit to screen by pressing ${shortcut}Escape.`,
        })
        return frame
    }

    refresh() {
        this.root.innerHTML = ''

        if (!Controller.getInstance().setting.frame) {
            new TitleBar(this.root)
        }

        const wrapper = new Element({
            tag: 'section',
            className: ['w-4/6', 'mx-auto'],
        })

        this.root.append(wrapper.element)
        wrapper.append(
            this.title,
            this.frame,
            this.helpText,
            this.maxHistory,
            this.adBlocker,
            this.adBlockerStatus,
            this.searchEngine,
            this.cacheSize,
        )
    }
}
