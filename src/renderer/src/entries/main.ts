import { A_Entry } from '@src/renderer/src/entries/abs-entry'
/* Utils */
import { checkElectron, navigate } from '@src/renderer/src/utils'
/* <HTML Fragments /> */
import { Card } from '@src/renderer/src/fragments/card'
import { Button } from '@src/renderer/src/fragments/button'
import { Input } from '@src/renderer/src/fragments/input'

type T_Card = {
    title: string
    description: string
    destination: string
}

const cards: Record<string, T_Card> = {
    bookmarks: {
        title: '🔖 Bookmark (B)',
        description: 'Your Bookmarks',
        destination: 'bookmarks.html',
    },
    anchors: {
        title: '⚓️ Anchor (A)',
        description:
            'Temporary bookmark that will be deleted once you clicked it.',
        destination: 'anchors.html',
    },
    history: {
        title: '📝 History (H)',
        description: 'Navigation history',
        destination: 'history.html',
    },
    popup: {
        title: '👮 Popup Blocker (P)',
        description: 'Manage Popup Blocker',
        destination: 'popup.html',
    },
    keystrokes: {
        title: '🎹 Keystroke (K)',
        description: 'Manage Keystrokes',
        destination: 'keystrokes.html',
    },
    shortcuts: {
        title: '🏁 Shortcuts (S)',
        description: 'Assign keyboard shortcuts.',
        destination: 'shortcuts.html',
    },
    setting: {
        title: '⚙️ Settings',
        description: '',
        destination: 'settings.html',
    },
}

class Main extends A_Entry {
    constructor() {
        super()

        new Button('Back to Browser (Esc)')
            .append(this.getSection('section-button'))
            .setOnClick(() => {
                navigate()
            })

        const input = new Input('Enter search keyword or address (⌘L)').append(
            this.getSection('section-address'),
        )
        input.setOnEnter((e: KeyboardEvent) => {
            if (e.key !== 'Enter') {
                return
            }

            const value = (e.target as HTMLInputElement).value.trim()
            if (!value) {
                return
            }

            navigate(value)
        })
        if (window.location.href.includes('address=true')) {
            input.element.focus()
        }

        Object.values(cards).forEach((card) => {
            new Card(card.title, card.description)
                .append(this.getSection('section-grid'))
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
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Main()
})
