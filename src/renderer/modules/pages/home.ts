import { PageType, TableAction } from '@src/types'
import Controller from '@home/modules/controller'
import Input from '@home/modules/fragments/input'
import Card from '@home/modules/fragments/card'
import Label from '@home/modules/fragments/label'
import { isMac, navigate, shortcutToHtml } from '@home/util'
import A_Page from '.'
import CardContainer from '../fragments/card-container'
import Callout from '../fragments/callout'
import Heading from '../fragments/heading'
import { Element } from '../fragments'

type Button = {
    title: string
    description: string
    destination: PageType
}

const buttons: Record<string, Button> = {
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
    welcome: {
        title: 'Visit Welcome Page',
        description: 'Double check the basic features of Focus',
        destination: PageType.WELCOME,
    },
}

export default class Home extends A_Page<null> {
    public page = PageType.HOME

    protected search: Input = new Input()

    constructor() {
        super()
        this.init()
    }

    render(): void {
        this.root.innerHTML = ''

        // Location Bar
        const command = isMac() ? '⌘' : 'Ctrl+'
        const label = new Label(
            {},
            `Enter search keyword or address (${command}L)`,
            this.search,
        )
        this.root.appendChild(label.element)

        this.renderCallout()

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
        this.root.appendChild(cardContainer.element)
    }

    private renderCallout() {
        if (!Controller.getInstance().helpText) {
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
        this.root.appendChild(callout.element)
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
