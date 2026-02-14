import { A_Page } from '@src/renderer/src/modules/pages/abs_page'

import { Element } from '@src/renderer/src/modules/fragments'
import { Input } from '@src/renderer/src/modules/fragments/input'
import { Title } from '@src/renderer/src/modules/fragments/title'
import { Heading } from '@src/renderer/src/modules/fragments/heading'
import { Button } from '@src/renderer/src/modules/fragments/button'

import { Channel, PageType, RequestHandler } from '@src/common/constants'
import { ipcRenderer } from '@src/renderer/src/utils'

import type { Info } from '@src/common/types'

export class Shortcut extends A_Page {
    public page = PageType.SHORTCUT

    constructor() {
        super()
        this.requestInfo('shortcuts')
    }

    private get title() {
        return new Title({ label: 'Shortcut' })
    }

    private getValue(key: string): string {
        return (this.settings.shortcuts && this.settings.shortcuts[key]) || ''
    }

    private inputs: Record<string, Input> = {}
    private getInput(key: string): Input {
        if (this.inputs[key]) {
            return this.inputs[key]
        }

        const value = this.getValue(key)
        this.inputs[key] = new Input({
            value,
            label: key,
        })
        return this.inputs[key]
    }

    private getSubHead(label: string): Heading {
        return new Heading(2).append(label)
    }

    private get button(): Button {
        return new Button({
            onClick: () => {
                const shortcuts: Record<string, string> = {}
                Object.keys(this.inputs)
                    .filter(
                        (key) =>
                            this.inputs[key] &&
                            this.inputs[key].value !== this.getValue(key),
                    )
                    .forEach((key) => {
                        shortcuts[key] = this.inputs[key].value
                    })

                if (Object.keys(shortcuts).length) {
                    ipcRenderer.send(Channel.INFO, RequestHandler.MODIFY, {
                        shortcuts,
                    } satisfies Partial<Info>)
                }
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

        wrapper.append(
            this.title,
            this.getSubHead('Edit'),
            this.getInput('Add Bookmark'),
            this.getInput('Add Anchor'),
            this.getSubHead('Navigate'),
            this.getInput('Address Bar'),
            this.getInput('Control Centre'),
            this.button,
        )
    }
}
