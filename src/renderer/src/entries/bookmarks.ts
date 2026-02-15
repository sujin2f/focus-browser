import { A_Entry } from '@src/renderer/src/entries/abs-entry'
/* Utils */
import {
    checkElectron,
    ipcRenderer,
    navigate,
    tagNameIs,
} from '@src/renderer/src/utils'
/* <HTML Fragments /> */
import { H1 } from '@src/renderer/src/fragments/h1'
import { Button } from '@src/renderer/src/fragments/button'
import { Input } from '@src/renderer/src/fragments/input'
import { Channel, RequestHandler } from '@src/common/constants'
import { Bookmark } from '@src/common/types'
import { BackButton } from '../fragments/back-button'
import { ListRow } from '../fragments/list-row'

class Bookmarks extends A_Entry {
    private bookmarks: Bookmark[] = []
    private search: Input

    constructor() {
        super()
        this.requestInfo('helpText', 'title', 'url')
        this.requestBookmarks()

        // Title
        const h1 = new H1('Bookmarks').prepend(this.getSection('section-title'))
        new BackButton().prepend(h1.element)

        // Buttons
        new Button('Add Bookmark (⌘D)').append(
            this.getSection('section-buttons'),
        )

        // Search
        this.search = new Input('Search Bookmark')
        this.search.append(this.getSection('section-search'))
        this.search.input.addEventListener('input', () => {
            // TODO search
        })
    }

    protected callbackShortcut(e: KeyboardEvent) {
        if (tagNameIs(document.activeElement, 'input')) {
            return
        }

        if (e.key.length !== 1) {
            return
        }

        if (e.altKey || e.ctrlKey || e.metaKey) {
            return
        }

        // Focus Search
        this.search.input.value = ''
        this.search.input.focus()
    }

    private requestBookmarks(): void {
        ipcRenderer.send(Channel.BOOKMARK, RequestHandler.REQUEST)

        ipcRenderer.once(Channel.BOOKMARK, (...args: unknown[]) => {
            const handler = args[0] as RequestHandler
            if (handler !== RequestHandler.RESPONSE) {
                return
            }

            this.bookmarks = args[1] as Bookmark[]
            this.renderList()
        })
    }

    private renderList() {
        this.getSection('section-list').innerHTML = ''
        this.bookmarks.forEach((bookmark) => {
            const row = new ListRow(bookmark.title, bookmark.url)
                .append(this.getSection('section-list'))
                .setOnClick((e: PointerEvent) => {
                    if (tagNameIs(e.target, 'button')) {
                        e.preventDefault()
                        return
                    }

                    navigate(bookmark.url)
                })
            new Button('⚙️', 'button-hollow')
                .append(row.suffix)
                .setOnClick(() => {
                    // TODO Edit Action
                })
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Bookmarks()
})
