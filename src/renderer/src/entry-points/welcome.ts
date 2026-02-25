import { A_Bookmarks } from './abstracts/abs-bookmarks'
/* Utils */
import {
    checkElectron,
    navigate,
    ipcRenderer,
    commandSymbol,
} from '@home/utils'
/* <HTML template-part /> */
import { H1 } from '@home/template-parts/h1'
import { H2 } from '@home/template-parts/h2'
import { Card } from '@home/template-parts/card'
import { UserInfo } from '@home/template-parts/user-info'
import { getAddressBar } from '@home/template-parts/modules/address-bar'
/* T_Types */
import type { T_Bookmark, T_Shortcut_Store } from '@src/common/types'
import type { ListItem } from '@home/template-parts/list-item'
/* CONSTANTS */
import {
    CENTRE_PAGES,
    EMOJI,
    IPC_CHANNELS,
    Menu,
    REQUEST_HANDLER,
} from '@src/common/constants'

class Welcome extends A_Bookmarks {
    private shortcuts: T_Shortcut_Store = {}
    constructor() {
        super('list--welcome')
        this.requestStatus('userInfo')
        this.requestShortcuts()

        new H1(`${EMOJI.FOCUS} Welcome to Focus!`).prependTo('root')

        new Card(
            `${EMOJI.HAND_HEART} Continue (Esc)`,
            'Visit the last page from your history',
        )
            .appendTo('grid')
            .setOnClick(() => {
                navigate({ lastVisit: true })
            })
        new Card(`${EMOJI.SETTINGS} Search Engine`, 'Search Web')
            .appendTo('grid')
            .setOnClick(() => {
                navigate({ searchEngine: true })
            })
    }

    private requestShortcuts(): void {
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

    protected callbackResponse(...args: unknown[]) {
        this.items = (args[1] as T_Bookmark[]).map((bookmark) => ({
            data: bookmark,
            items: [] as ListItem[],
        }))

        if (this.items.length) {
            new H2(`${EMOJI[Menu.ADD_BOOKMARK]} Your Bookmarks`).prependTo(
                'bookmarks',
            )
        }
        this.renderList()
    }

    protected callbackShortcut(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            navigate({ lastVisit: true })
        }
    }

    protected callbackUpdateStatus() {
        if (!this.settings.userInfo) {
            return
        }
        const userInfo = JSON.parse(this.settings.userInfo)
        new UserInfo().picture = userInfo.picture
    }

    private render(): void {
        getAddressBar(this.shortcuts[Menu.ADDRESS]).focus()
        const shortcut = this.shortcuts[Menu.CENTRE]
            ? `(${commandSymbol(this.shortcuts[Menu.CENTRE])})`
            : ''
        new Card(
            `${EMOJI.CENTRE} Control Centre ${shortcut}`,
            'Check out what to do',
        )
            .appendTo('grid')
            .setOnClick(() => {
                window.location.href = CENTRE_PAGES.HOME
            })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Welcome()
})
