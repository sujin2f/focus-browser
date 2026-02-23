import { A_Entry } from '@src/renderer/src/entry-points/abstracts/abs-entry'
/* Utils */
import { checkElectron } from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { Card } from '@src/renderer/src/template-parts/card'
import { BackButton } from '@src/renderer/src/template-parts/back-button'
import { getAddressBar } from '@src/renderer/src/template-parts/modules/address-bar'
import { Input } from '@src/renderer/src/template-parts/input'
import { H1 } from '@src/renderer/src/template-parts/h1'
/* CONSTANTS */
import { EMOJI, Menu } from '@src/common/constants'

type T_Card = {
    title: string
    description: string
    destination: string
}

const cards: Record<string, T_Card> = {
    bookmarks: {
        title: `${EMOJI[Menu.ADD_BOOKMARK]} Bookmark (B)`,
        description: 'Your Bookmarks',
        destination: 'bookmarks.html',
    },
    anchors: {
        title: `${EMOJI[Menu.ADD_ANCHOR]} Anchor (A)`,
        description:
            'Temporary bookmark that will be deleted once you clicked it.',
        destination: 'anchors.html',
    },
    history: {
        title: `${EMOJI.HISTORY} History (H)`,
        description: 'Navigation history',
        destination: 'history.html',
    },
    popup: {
        title: `${EMOJI.POPUP_BLOCKER} Popup Blocker (P)`,
        description: 'Manage Popup Blocker',
        destination: 'popup.html',
    },
    keystrokes: {
        title: `${EMOJI.KEYSTROKES} Keystroke (K)`,
        description: 'Manage Keystrokes',
        destination: 'keystrokes.html',
    },
    shortcuts: {
        title: `${EMOJI.SHORTCUTS} Shortcuts (S)`,
        description: 'Assign keyboard shortcuts.',
        destination: 'shortcuts.html',
    },
    setting: {
        title: `${EMOJI.SETTINGS} Settings`,
        description: '',
        destination: 'settings.html',
    },
    cleaner: {
        title: `${EMOJI.CLEANER} Cleaner`,
        description: 'Clear cache, history, and else',
        destination: 'cleaner.html',
    },
}

class Main extends A_Entry {
    private input?: Input

    constructor() {
        super()
        this.requestStatus('url', 'shortcutAddress', 'userInfo')

        // Title
        const h1 = new H1('Press Esc to Browser Mode').prependTo('title')
        new BackButton().prependTo(h1.element)

        Object.values(cards).forEach((card) => {
            new Card(card.title, card.description)
                .appendTo('grid')
                .setOnClick(() => {
                    window.location.href = card.destination
                })
        })
    }

    protected callbackShortcut(e: KeyboardEvent) {
        super.callbackShortcut(e)

        if (
            e.location === e.DOM_KEY_LOCATION_STANDARD &&
            document.activeElement &&
            document.activeElement.tagName.toLowerCase() !== 'input'
        ) {
            switch (e.code) {
                case 'KeyB':
                    window.location.href = cards.bookmarks.destination
                    return true
                case 'KeyH':
                    window.location.href = cards.history.destination
                    return true
                case 'KeyA':
                    window.location.href = cards.anchors.destination
                    return true
                case 'KeyK':
                    window.location.href = cards.keystrokes.destination
                    return true
                case 'KeyP':
                    window.location.href = cards.popup.destination
                    return true
                case 'KeyS':
                    window.location.href = cards.shortcuts.destination
                    return true
            }
        }
    }

    protected callbackUpdateStatus(): void {
        this.input = getAddressBar('form', this.settings.shortcutAddress)

        if (window.location.href.includes('address=true')) {
            this.input.value = this.settings.url
            this.input.selectText()
            this.input.focus()
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Main()
})
