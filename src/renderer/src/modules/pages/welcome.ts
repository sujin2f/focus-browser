import { A_Page } from '@src/renderer/src/modules/pages/abs_page'

import { Element } from '@src/renderer/src/modules/fragments'
import { ButtonGroup } from '@src/renderer/src/modules/fragments/button-group'
import { Button } from '@src/renderer/src/modules/fragments/button'
import { Heading } from '@src/renderer/src/modules/fragments/heading'

import { CTRL, CENTRE_PAGES } from '@src/common/constants'
import { ctrlOrComm, navigate } from '@src/renderer/src/utils'
import { ShortcodeTable } from '../fragments/table-shortcode'

export class Welcome extends A_Page {
    public readonly page = CENTRE_PAGES.WELCOME

    private get welcome() {
        return new Heading(1).append('Single Tab Browser for Fast Navigation')
    }

    private get paragraph() {
        return new Element<HTMLParagraphElement>({
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
    }

    private get buttons() {
        const btnCentre = new Button({
            onClick: () => {
                location.href = 'index.html'
            },
        })
        btnCentre.append(`Control Center (${ctrlOrComm()}\`)`)

        return new ButtonGroup().append(
            btnCentre,
            new Button({
                onClick: () => {
                    navigate()
                },
            }).append('Web Browser (Esc)'),
        )
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
                'max-w-4xl',
                'm-auto',
            ],
        })
    }

    constructor() {
        super()

        const table = new ShortcodeTable({
            Esc: 'Switch to browser mode',
            [`${CTRL}+L`]: 'Input URL to navigate or search text',
            [`${CTRL}+\``]: 'Show Control Centre',
            [`${CTRL}+D`]: '[Browser Mode] Add Bookmark',
            [`${CTRL}+/`]: '[Browser Mode] Add Anchor(Instant bookmark)',
        })

        this.root
            .reset()
            .append(
                this.container.append(
                    this.welcome,
                    this.paragraph,
                    this.buttons,
                    table,
                ),
            )
    }

    refresh(): void {}
}
