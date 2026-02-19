import { A_Bookmarks } from './abstracts/abs-bookmarks'
/* Utils */
import { checkElectron, navigate } from '@src/renderer/src/utils'
/* CONSTANTS */
import { NAVIGATION } from '@src/common/constants'
/* <HTML template-part /> */
import { H1 } from '@src/renderer/src/template-parts/h1'
import { H2 } from '@src/renderer/src/template-parts/h2'
import { Card } from '@src/renderer/src/template-parts/card'
import type { ListItem } from '@src/renderer/src/template-parts/list-item'
import { getAddressBar } from '@src/renderer/src/template-parts/modules/address-bar'
/* T_Types */
import type { T_Bookmark } from '@src/common/types'

class Welcome extends A_Bookmarks {
    constructor() {
        super('bookmark--welcome')

        new H1('🅕 Welcome to Focus!').prependTo('root')

        getAddressBar('form').focus()

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

    protected callbackResponse(...args: unknown[]) {
        this.items = (args[1] as T_Bookmark[]).map((bookmark) => ({
            data: bookmark,
            items: [] as ListItem[],
        }))

        if (this.items.length) {
            new H2('🔖 Your Bookmarks').prependTo('bookmarks')
        }
        this.renderList()
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
