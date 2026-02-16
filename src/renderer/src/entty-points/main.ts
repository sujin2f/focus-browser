import { A_Entry } from '@src/renderer/src/entty-points/abs-entry'
/* Utils */
import { checkElectron, navigate, getSection } from '@src/renderer/src/utils'
/* <HTML Fragments /> */
import { Card } from '@src/renderer/src/fragments/card'
import { Input } from '@src/renderer/src/fragments/input'
import { BackButton } from '@src/renderer/src/fragments/back-button'

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

        new BackButton().appendTo('button')

        getSection<HTMLFormElement>('address').addEventListener(
            'submit',
            (e) => {
                e.preventDefault()
                const target = e.target as HTMLFormElement
                const formData = new FormData(target)
                const address = formData.get('address')?.toString().trim()
                if (!address) {
                    return
                }
                navigate(address)
            },
        )

        const input = new Input(
            'Enter search keyword or address (⌘L)',
            'search',
        ).appendTo('address')
        input.name = 'address'

        if (window.location.href.includes('address=true')) {
            input.element.focus()
        }

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
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Main()
})
