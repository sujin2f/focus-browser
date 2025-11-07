import { A_Page } from '@home/modules/pages/abs_page'

import { Element } from '@home/modules/fragments'
import { Input } from '@home/modules/fragments/input'
import Card from '@home/modules/fragments/card'
import CardContainer from '@home/modules/fragments/card-container'
import { Callout } from '@home/modules/fragments/callout'
import { Title } from '@home/modules/fragments/title'
import { ShortcodeTable } from '@home/modules/fragments/table-shortcode'

import { ctrlOrComm, isMac, navigate, SwitchEvent } from '@home/utils'
import { CTRL, PageType } from '@src/common/constants'

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
 * - <back button />
 * - <location />
 * - <current URL />
 * - <help-text />
 * - <cards />
 */
export class Home extends A_Page {
    public page = PageType.HOME
    protected search: Input
    private title: Title = new Title()
    private location: Element<HTMLElement> = new Element({ tag: 'section' })
    private currentURL: Element<HTMLElement> = new Element({ tag: 'section' })
    private helpText: Element<HTMLElement> = new Element({ tag: 'section' })
    private cards: Element<HTMLElement> = new Element({ tag: 'section' })

    constructor() {
        super()
        this.requestInfo('helpText', 'frame', 'url')
    }

    refresh() {
        this.root.reset(this.settings.frame)
        this.location.reset()
        this.currentURL.reset()
        this.helpText.reset()
        this.cards.reset()

        this.root.append(
            this.title,
            this.location,
            this.currentURL,
            this.helpText,
            this.cards,
        )

        // Location Bar
        this.search = new Input({
            label: `Enter search keyword or address (${ctrlOrComm()}L)`,
        })
        this.location.append(this.search)

        // Cards
        const cardContainer = new CardContainer()
        Object.keys(buttons).forEach((key) => {
            const info = buttons[key]
            const card = new Card()

            card.title = info.title
            card.description = info.description
            card.addEventListener('click', () => {
                document.dispatchEvent(new SwitchEvent(info.destination))
            })

            cardContainer.append(card)
        })
        this.cards.append(cardContainer)

        this.renderHelpText()
    }

    private renderHelpText() {
        this.helpText.innerHTML = ''
        if (!this.settings.helpText) {
            return
        }

        const callout = new Callout({
            className: ['mb-2', 'max-w-2xl'],
        }).append(
            new ShortcodeTable({
                Esc: 'Switch to Browser Mode',
                [`${CTRL}+L`]: 'Input URL to navigate or search text',
                [`${CTRL}+\``]: 'Show Control Centre',
                B: 'Show Bookmarks',
                A: 'Show Anchors',
                H: 'Show History',
                P: 'Show Blocked or Allowed Popups',
            }),
        )
        this.helpText.append(callout)
    }

    protected focus() {
        this.search.value = this.settings.url
        this.search.input.element.select()
    }

    doShortcut(e: KeyboardEvent): boolean {
        if (
            e.code === 'KeyL' &&
            ((isMac() && e.metaKey) || (!isMac() && e.ctrlKey))
        ) {
            this.focus()
            return
        }

        if (
            e.location === e.DOM_KEY_LOCATION_STANDARD &&
            document.activeElement.tagName.toLowerCase() !== 'input'
        ) {
            switch (e.code) {
                case 'KeyB':
                    document.dispatchEvent(new SwitchEvent(PageType.BOOKMARK))
                    return
                case 'KeyH':
                    document.dispatchEvent(new SwitchEvent(PageType.HISTORY))
                    return
                case 'KeyA':
                    document.dispatchEvent(new SwitchEvent(PageType.ANCHOR))
                    return
                case 'KeyP':
                    document.dispatchEvent(
                        new SwitchEvent(PageType.POPUP_BLOCKER),
                    )
                    return
            }
        } else {
            if (e.key === 'Enter') {
                if (!this.search.value || !this.search.value.trim()) {
                    return
                }

                navigate(this.search.value.trim())
                this.search.value = ''
                return
            }
        }

        super.doShortcut(e)
    }
}
