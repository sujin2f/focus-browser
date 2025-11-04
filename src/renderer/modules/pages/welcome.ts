import { A_Page } from '@home/modules/pages/abs_page'
import { Controller } from '@home/modules/controller'

import { Element } from '@home/modules/fragments'
import { ButtonGroup } from '@home/modules/fragments/button-group'
import { Button } from '@home/modules/fragments/button'
import { Heading } from '@home/modules/fragments/heading'
import { TitleBar } from '@home/modules/fragments/title-bar'

import { PageType } from '@src/constants'
import { isMac, navigate } from '@home/util'

export class Welcome extends A_Page {
    public readonly page = PageType.WELCOME

    constructor() {
        super()

        this.root.innerHTML = ''

        if (!Controller.getInstance().setting.frame) {
            new TitleBar(this.root)
        }

        // H1
        const heading = new Heading(1).append(
            'Single Tab Browser for Fast Navigation',
        )

        // P
        const p = new Element<HTMLParagraphElement>({
            tag: 'p',
            className: ['text-xl', 'text-center', 'text-gray-400', 'mb-5'],
        }).append(
            'Focus is a ',
            new Element<HTMLParagraphElement>({
                tag: 'span',
                className: ['dark:text-white'],
            }).append('single tab'),
            ' web browser',
            new Element({ tag: 'br' }),
            'with a quick ',
            new Element<HTMLParagraphElement>({
                tag: 'span',
                className: ['dark:text-white'],
            }).append('keyboard shortcut'),
            ' navigation.',
        )

        // Buttons
        const btnCentre = new Button({
            onClick: () => {
                location.href = 'index.html'
            },
        })
        if (isMac()) {
            btnCentre.append('Control Center (⌘`)')
        } else {
            btnCentre.append('Control Center (Ctrl+`)')
        }

        const buttons = new ButtonGroup().append(
            btnCentre,
            new Button({
                onClick: () => {
                    navigate()
                },
            }).append('Web Browser (Escape)'),
        )

        // Container
        const container = new Element<HTMLDivElement>({
            tag: 'div',
            className: [
                'flex',
                'flex-col',
                'h-dvh',
                'justify-center',
                'items-center',
            ],
        }).append(heading, p, buttons)
        this.root.appendChild(container.element)
    }

    refresh(): void {}
}
