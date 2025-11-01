import { A_Page } from '@home/modules/pages/abs_page'

import { Element } from '@home/modules/fragments'
import { ButtonGroup } from '@home/modules/fragments/button-group'
import { Button } from '@home/modules/fragments/button'
import { Heading } from '@home/modules/fragments/heading'

import { PageType } from '@src/constants'
import { isMac, navigate } from '@home/util'

export class Welcome extends A_Page {
    public readonly page = PageType.WELCOME

    constructor() {
        super()

        this.root.innerHTML = ''
        // H1
        const heading = new Heading(
            1,
            {},
            'Single Tab Browser for Fast Navigation',
        )

        // P
        const p = new Element<HTMLParagraphElement>(
            'p',
            {
                className: ['text-xl', 'text-center', 'text-gray-400', 'mb-5'],
            },
            'Focus is a ',
            new Element<HTMLParagraphElement>(
                'span',
                { className: ['dark:text-white'] },
                'single tab',
            ),
            ' web browser',
            new Element('br'),
            'with a quick ',
            new Element<HTMLParagraphElement>(
                'span',
                { className: ['dark:text-white'] },
                'keyboard shortcut',
            ),
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

        const buttons = new ButtonGroup(
            {},
            btnCentre,
            new Button(
                {
                    onClick: () => {
                        navigate()
                    },
                },
                'Web Browser (Escape)',
            ),
        )

        // Container
        const container = new Element<HTMLDivElement>(
            'div',
            {
                className: [
                    'flex',
                    'flex-col',
                    'h-dvh',
                    'justify-center',
                    'items-center',
                ],
            },
            heading,
            p,
            buttons,
        )
        this.root.appendChild(container.element)
    }

    refresh(): void {}
}
