import { A_Page } from '@src/renderer/src/modules/pages/abs_page'

import { Element } from '@src/renderer/src/modules/fragments'
import { Input } from '@src/renderer/src/modules/fragments/input'
import { Title } from '@src/renderer/src/modules/fragments/title'
import { Select } from '@src/renderer/src/modules/fragments/select'
import { Button } from '@src/renderer/src/modules/fragments/button'

import { ipcRenderer } from '@src/renderer/src/utils'
import type { Info } from '@src/common/types'
import { IPC_CHANNELS, PageType, RequestHandler } from '@src/common/constants'

export class Keystrokes extends A_Page {
    public page = PageType.SETTING

    constructor() {
        super()
        this.requestInfo('keystrokes', 'url')
    }

    private get title() {
        return new Title({ label: 'Keystroke' })
    }

    private get host() {
        return this.settings.url ? new URL(this.settings.url).host : ''
    }

    private get hosts() {
        const host = this.host
        const options = Object.keys(this.settings.keystrokes || {}).reduce(
            (prev, current) => {
                return { ...prev, [current]: current }
            },
            {} as Record<string, string>,
        )
        if (!options[host]) {
            options[host] = ''
        }

        return new Select({
            label: 'Hosts',
            onChange: () => {},
            options,
            value: host || '',
        })
    }

    private input?: Input
    private createInput() {
        const value =
            (this.settings.keystrokes && this.settings.keystrokes[this.host]) ||
            ''
        this.input = new Input({
            label: 'Keystroke',
            value,
            helpText: 'Type [Tab], [Space], and [Enter] for those keystrokes.',
        })
        return this.input
    }

    private get button(): Button {
        return new Button({
            onClick: () => {
                if (!this.host || !this.input || !this.input.value) {
                    return
                }
                ipcRenderer.send(IPC_CHANNELS.INFO, RequestHandler.MODIFY, {
                    keystrokes: { [this.host]: this.input.value },
                } satisfies Partial<Info>)
            },
        }).append('Save Changes')
    }

    refresh() {
        this.root.reset(this.settings.frame)
        console.log(this.settings)

        const wrapper = new Element({
            tag: 'section',
            className: ['w-4/6', 'mx-auto'],
        })

        this.root.append(wrapper)
        wrapper.append(this.title, this.hosts, this.createInput(), this.button)
    }
}
