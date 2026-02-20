import { A_Bookmarks } from './abstracts/abs-bookmarks'
/* Utils */
import { checkElectron, navigate } from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { H1 } from '@src/renderer/src/template-parts/h1'
import { H2 } from '@src/renderer/src/template-parts/h2'
import { Card } from '@src/renderer/src/template-parts/card'
import type { ListItem } from '@src/renderer/src/template-parts/list-item'
import { getAddressBar } from '@src/renderer/src/template-parts/modules/address-bar'
/* T_Types */
import type { T_Bookmark } from '@src/common/types'
import { EMOJI, Menu } from '@src/common/constants'

class Welcome extends A_Bookmarks {
    constructor() {
        super('bookmark--welcome')

        new H1(`${EMOJI.FOCUS} Welcome to Focus!`).prependTo('root')

        getAddressBar('form').focus()

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
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Welcome()
})
