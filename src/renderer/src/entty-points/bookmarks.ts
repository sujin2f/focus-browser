import { A_List } from '@src/renderer/src/entty-points/abs-list'
/* Utils */
import {
    checkElectron,
    ipcRenderer,
    navigate,
    getSection,
    tagNameIs,
} from '@src/renderer/src/utils'
/* <HTML Fragments /> */
import { H1 } from '@src/renderer/src/fragments/h1'
import { Button } from '@src/renderer/src/fragments/button'
import { BackButton } from '@src/renderer/src/fragments/back-button'
import { ListRow } from '@src/renderer/src/fragments/list-row'
/* CONSTANTS */
import { IPC_CHANNELS, RequestHandler } from '@src/common/constants'
/* T_Types */
import type { Bookmark } from '@src/common/types'

import { Modal } from '@src/renderer/src/fragments/modal'

class Bookmarks extends A_List<Bookmark> {
    protected isSearchActivated() {
        return !this.modal.activated
    }

    protected modal = new Modal().appendTo('root')

    constructor() {
        super()
        this.requestInfo('helpText', 'title', 'url')
        this.requestBookmarks()

        // Title
        const h1 = new H1('Bookmarks 🔖').prependTo('title')
        new BackButton().prependTo(h1.element)

        // Buttons
        new Button('Add Bookmark (⌘D)').appendTo('buttons')
    }

    protected callbackShortcut(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            if (this.modal.activated) {
                this.modal.hide()
                return
            }
        }

        super.callbackShortcut(e)
    }

    private requestBookmarks(): void {
        ipcRenderer.send(IPC_CHANNELS.BOOKMARK, RequestHandler.REQUEST)

        ipcRenderer.once(IPC_CHANNELS.BOOKMARK, (...args: unknown[]) => {
            const handler = args[0] as RequestHandler
            if (handler !== RequestHandler.RESPONSE) {
                return
            }

            this.items = args[1] as Bookmark[]
            this.listItems = this.items
            this.renderList()
        })
    }

    renderList() {
        getSection('list').innerHTML = ''
        this.listItems.forEach((bookmark) => {
            const row = new ListRow(bookmark.title, bookmark.url)
                .appendTo('list')
                .setOnClick((e: PointerEvent) => {
                    if (tagNameIs(e.target, 'button')) {
                        e.preventDefault()
                        return
                    }

                    navigate(bookmark.url)
                })

            new Button('⚙️', 'button-clear')
                .appendTo(row.suffix)
                .setOnClick(() => {
                    // TODO Edit Action
                    this.modal.show()
                })

            if (bookmark.shortcut) {
                // Shortcut
                new Button(bookmark.shortcut.toUpperCase())
                    .prependTo(row.suffix)
                    .setOnClick(() => {
                        navigate(bookmark.url)
                    })
            }
        })
    }

    filterList(item: Bookmark, keyword: string): boolean {
        return (
            item.shortcut?.toLowerCase().includes(keyword) ||
            item.title.toLowerCase().includes(keyword)
        )
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Bookmarks()
})
