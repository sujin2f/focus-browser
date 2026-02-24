import { A_Entry } from '@src/renderer/src/entry-points/abstracts/abs-entry'
/* Utils */
import { checkElectron, ipcRenderer } from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { Card } from '@src/renderer/src/template-parts/card'
import { BackButton } from '@src/renderer/src/template-parts/back-button'
import { Input } from '@src/renderer/src/template-parts/input'
import { H1 } from '@src/renderer/src/template-parts/h1'
import { UserInfo } from '@src/renderer/src/template-parts/user-info'
import { getAddressBar } from '@src/renderer/src/template-parts/modules/address-bar'
/* CONSTANTS */
import {
    EMOJI,
    IPC_CHANNELS,
    Menu,
    REQUEST_HANDLER,
} from '@src/common/constants'
/* T_Types */
import type { T_Shortcut_Store } from '@src/common/types'

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
    importer: {
        title: `${EMOJI.CLOUD} Importer`,
        description: 'Import Bookmark from cloud',
        destination: 'importer.html',
    },
}

class Main extends A_Entry {
    private shortcuts: T_Shortcut_Store = {}
    private input?: Input

    constructor() {
        super()
        this.requestStatus('url', 'userInfo')
        this.request()

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

    protected callbackUpdateStatus() {
        this.focus()
        if (!this.settings.userInfo) {
            return
        }
        const userInfo = JSON.parse(this.settings.userInfo)
        new UserInfo().picture = userInfo.picture
    }

    private request(): void {
        ipcRenderer.send(IPC_CHANNELS.SHORTCUTS, REQUEST_HANDLER.REQUEST)
        ipcRenderer.on(IPC_CHANNELS.SHORTCUTS, (handler, shortcuts = {}) => {
            switch (handler) {
                case REQUEST_HANDLER.RESPONSE: {
                    this.shortcuts = shortcuts
                    this.render()
                    return
                }
            }
        })
    }

    private render(): void {
        this.input = getAddressBar(this.shortcuts[Menu.ADDRESS])
        this.focus()
    }

    private focus() {
        if (window.location.href.includes('address=true') && this.input) {
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
