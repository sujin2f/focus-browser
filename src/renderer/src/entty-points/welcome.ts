import { A_Entry } from '@src/renderer/src/entty-points/abs-entry'
/* Utils */
import { checkElectron, ipcRenderer, navigate } from '@src/renderer/src/utils'
/* CONSTANTS */
import { IPC_CHANNELS, NAVIGATION, RequestHandler } from '@src/common/constants'
/* <HTML template-part /> */
import { H1 } from '@src/renderer/src/template-parts/h1'
import { H2 } from '@src/renderer/src/template-parts/h2'
import { Card } from '@src/renderer/src/template-parts/card'
import { ListRow } from '@src/renderer/src/template-parts/list-row'
import { getAddressBar } from '@src/renderer/src/template-parts/modules/address-bar'
/* T_Types */
import type { T_Bookmark } from '@src/common/types'
class Welcome extends A_Entry {
    constructor() {
        super()

        this.request()

        new H1('🅕 Welcome to Focus!').prependTo('root')

        getAddressBar('form')

        new Card('🫰 Continue (Esc)', 'Visit the last page from your history')
            .appendTo('grid')
            .setOnClick(() => {
                navigate(NAVIGATION.LAST_VISIT)
            })
        new Card('⚙️ Search Engine', 'Search Web')
            .appendTo('grid')
            .setOnClick(() => {
                navigate(NAVIGATION.SEARCH_ENGINE)
            })
    }

    private request() {
        ipcRenderer.send(IPC_CHANNELS.BOOKMARK, RequestHandler.REQUEST)

        ipcRenderer.on(IPC_CHANNELS.BOOKMARK, (...args: unknown[]) => {
            const handler = args[0] as RequestHandler
            if (handler !== RequestHandler.RESPONSE) {
                return
            }

            const items = args[1] as T_Bookmark[]

            if (items.length) {
                new H2('Your Bookmarks').prependTo('bookmarks')
            }

            items.forEach((bookmark) => {
                new ListRow(bookmark.title, bookmark.url)
                    .appendTo('list')
                    .setOnClick(() => {
                        navigate(bookmark.url)
                    })
            })
        })
    }

    protected callbackShortcut(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            navigate(NAVIGATION.LAST_VISIT)
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Welcome()
})
