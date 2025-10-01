import { A_Page } from '@home/modules/pages/abs_page'

import { Element } from '@home/modules/fragments'
import Controller from '@home/modules/controller'
import Input from '@home/modules/fragments/input'
import Card from '@home/modules/fragments/card'
import Label from '@home/modules/fragments/label'
import CardContainer from '@home/modules/fragments/card-container'
import Callout from '@home/modules/fragments/callout'

import { isMac, navigate, shortcutToHtml } from '@home/util'
import { PageType } from '@src/types'

/**
 * For creating cards
 */
type T_Card = {
    title: string
    description: string
    destination: PageType
}

const buttons: Record<string, T_Card> = {
    bookmarks: {
        title: 'Bookmark (B)',
        description: 'Manage bookmarks',
        destination: PageType.BOOKMARK,
    },
    anchor: {
        title: 'Anchor (A)',
        description:
            'Temporary bookmark that will be deleted once you clicked it.',
        destination: PageType.ANCHOR,
    },
    history: {
        title: 'History (H)',
        description: 'Manage history',
        destination: PageType.HISTORY,
    },
    popup: {
        title: 'Popup Blocker (P)',
        description: 'Manage Popup Blocker',
        destination: PageType.POPUP_BLOCKER,
    },
    setting: {
        title: 'Setting',
        description: '',
        destination: PageType.SETTING,
    },
    welcome: {
        title: 'Visit Welcome Page',
        description: 'Double check the basic features of Focus',
        destination: PageType.WELCOME,
    },
}

/**
 * The HTML layout is :
 * - <location />
 * - <help-text />
 * - <cards />
 */
export class Home extends A_Page {
    public page = PageType.HOME
    protected search: Input = new Input()
    private location: Element<HTMLElement> = new Element('section')
    private helpText: Element<HTMLElement> = new Element('section')
    private cards: Element<HTMLElement> = new Element('section')

    constructor() {
        super()
        this.root.innerHTML = ''
        this.root.append(
            this.location.element,
            this.helpText.element,
            this.cards.element,
        )
        this.render()
    }

    render(): void {
        // Location Bar
        const command = isMac() ? '⌘' : 'Ctrl+'
        const label = new Label(
            { title: `Enter search keyword or address (${command}L)` },
            this.search,
        )
        this.location.append(label)

        // Cards
        const cardContainer = new CardContainer()
        Object.keys(buttons).forEach((key) => {
            const info = buttons[key]
            const card = new Card()

            card.title = info.title
            card.description = info.description
            card.addEventListener('click', () => {
                Controller.getInstance().switch(info.destination)
            })

            cardContainer.append(card)
        })
        this.cards.append(cardContainer)
    }

    cbInfoUpdated() {
        if (!Controller.getInstance().setting.helpText) {
            return
        }
        const command = isMac() ? '⌘' : 'Ctrl+'
        const callout = new Callout(
            { className: ['mb-2'] },
            new Element(
                'p',
                { className: ['text-gray-300', 'mb-2'] },
                'Press ',
                ...shortcutToHtml('Escape'),
                ' key to switch to a browser mode. From browser mode,',
                new Element('br'),
                'you can come back here by pressing ',
                ...shortcutToHtml(`${command}+\``),
                ' or ',
                ...shortcutToHtml(`${command}+L`),
            ),
            new Element(
                'p',
                { className: ['text-gray-300'] },
                'In the browser mode, press ',
                ...shortcutToHtml(`${command}+[`),
                ' and ',
                ...shortcutToHtml(`${command}+]`),
                ' to navigate back and forward.',
            ),
        )
        this.helpText.append(callout)
    }

    doShortcut(e: KeyboardEvent): boolean {
        if (document.activeElement.tagName.toLowerCase() !== 'input') {
            switch (e.key) {
                case 'B':
                case 'b':
                    Controller.getInstance().switch(PageType.BOOKMARK)
                    return
                case 'h':
                case 'H':
                    Controller.getInstance().switch(PageType.HISTORY)
                    return
                case 'a':
                case 'A':
                    Controller.getInstance().switch(PageType.ANCHOR)
                    return
                case 'p':
                case 'P':
                    Controller.getInstance().switch(PageType.POPUP_BLOCKER)
                    return
            }
        } else {
            if (e.key === 'Enter') {
                if (!this.search.value) {
                    return
                }

                navigate(this.search.value)
                this.search.value = ''
                return
            }
        }

        super.doShortcut(e)
    }
}
