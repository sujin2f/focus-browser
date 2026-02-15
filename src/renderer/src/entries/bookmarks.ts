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
import { BackButton } from '@src/renderer/src/fragments/back-button'
import { ListRow } from '@src/renderer/src/fragments/list-row'
/* CONSTANTS */
import { IPC_CHANNELS, RequestHandler } from '@src/common/constants'
/* T_Types */
import type { Bookmark } from '@src/common/types'

class Bookmarks extends A_Entry {
    private bookmarks: Bookmark[] = []
    private search: Input

    constructor() {
        super()
        this.requestInfo('helpText', 'title', 'url')
        this.requestBookmarks()

        // Title
        const h1 = new H1('Bookmarks 🔖').prepend(
            this.getSection('section-title'),
        )
        new BackButton().prepend(h1.element)

        // Buttons
        new Button('Add Bookmark (⌘D)').append(
            this.getSection('section-buttons'),
        )

        // Search
        this.search = new Input('Search Bookmark')
            .append(this.getSection('section-search'))
            .setOnInput(() => {
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
        this.search.value = ''
        this.search.focus()
    }

    private requestBookmarks(): void {
        ipcRenderer.send(IPC_CHANNELS.BOOKMARK, RequestHandler.REQUEST)

        ipcRenderer.once(IPC_CHANNELS.BOOKMARK, (...args: unknown[]) => {
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
