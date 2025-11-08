import { A_Page } from '@home/modules/pages/abs_page'

import { Element } from '@home/modules/fragments'
import { Input } from '@home/modules/fragments/input'
import { Title } from '@home/modules/fragments/title'
import { Select } from '@home/modules/fragments/select'
import { Button } from '@home/modules/fragments/button'

import { ipcRenderer, ctrlOrComm } from '@home/utils'
import type { Info } from '@src/common/types'
import {
    Channel,
    PageType,
    RequestHandler,
    SearchEngine,
} from '@src/common/constants'

export class Setting extends A_Page {
    public page = PageType.SETTING

    constructor() {
        super()

        this.requestInfo(
            'helpText',
            'maxHistory',
            'adBlocker',
            'adBlockerStatus',
            'cacheSize',
            'searchEngine',
            'frame',
        )
    }

    private get title() {
        return new Title({ label: 'Setting' })
    }

    private get helpText() {
        const helpText = new Input({
            type: 'checkbox',
            checked: this.settings.helpText,
            onChange: () => {
                ipcRenderer.send(Channel.INFO, RequestHandler.MODIFY, {
                    helpText: helpText.checked,
                } satisfies Partial<Info>)
            },
            label: 'Show Help Text',
        })
        return helpText
    }

    private get maxHistory() {
        const maxHistory = new Input({
            type: 'number',
            value: this.settings.maxHistory.toString(),
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
            },
            label: 'Maximum History',
        })
        return maxHistory
    }

    private get adBlocker() {
        const adBlocker = new Input({
            type: 'checkbox',
            checked: this.settings.adBlocker,
            onChange: () => {
                ipcRenderer.send(Channel.INFO, RequestHandler.MODIFY, {
                    adBlocker: adBlocker.checked,
                } satisfies Partial<Info>)
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
                    if (this.settings.adBlockerStatus === null) {
                        return 'Failed to load. Click here to retry.'
                    }
                    if (this.settings.adBlockerStatus === false) {
                        return 'Disabled'
                    }

                    return 'Working!'
                })(),
            ),
            this.settings.adBlockerStatus === null
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
        let cacheSize = this.settings.cacheSize
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
            value: this.settings.searchEngine,
        })
        return searchEngine
    }

    private get frame() {
        const frame = new Input({
            type: 'checkbox',
            checked: this.settings.frame,
            onChange: () => {
                ipcRenderer.send(Channel.INFO, RequestHandler.MODIFY, {
                    frame: frame.checked,
                } satisfies Partial<Info>)
            },
            label: 'Show Native Frame',
            helpText: `Note: This requires restarting the application. You can toggle window fit to screen by pressing ${ctrlOrComm()}Esc.`,
        })
        return frame
    }

    private get version() {
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
            }).append('Version'),
            new Element({
                tag: 'div',
                className: ['mr-3'],
            }).append(envVersion),
        )
    }

    refresh() {
        this.root.reset(this.settings.frame)

        const wrapper = new Element({
            tag: 'section',
            className: ['w-4/6', 'mx-auto'],
        })

        this.root.append(wrapper)
        wrapper.append(
            this.title,
            this.version,
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
