import { A_ListSearch } from '@src/renderer/src/entry-points/abstracts/abs-list-search'
/* Utils */
import {
    checkElectron,
    ipcRenderer,
    navigate,
    // getSection,
} from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { H1 } from '@src/renderer/src/template-parts/h1'
import { BackButton } from '@src/renderer/src/template-parts/back-button'
import { ListItem } from '@src/renderer/src/template-parts/list-item'
/* CONSTANTS */
import { IPC_CHANNELS, RequestHandler } from '@src/common/constants'
/* T_Types */
import type { T_Bookmark } from '@src/common/types'

class Anchors extends A_ListSearch<T_Bookmark> {
    constructor() {
        super()
        this.requestInfo('title', 'url')
        this.requestAnchors()

        // Title
        const h1 = new H1('Anchors ⚓️').prependTo('title')
        new BackButton().prependTo(h1.element)
    }

    private requestAnchors(): void {
        ipcRenderer.send(IPC_CHANNELS.ANCHOR, RequestHandler.REQUEST)

        ipcRenderer.once(IPC_CHANNELS.ANCHOR, (...args: unknown[]) => {
            const handler = args[0] as RequestHandler
            if (handler !== RequestHandler.RESPONSE) {
                return
            }

            this.items = (args[1] as T_Bookmark[]).map((bookmark) => ({
                data: bookmark,
                items: [] as ListItem[],
            }))
            this.renderList()
        })
    }

    protected renderList() {
        super.renderList()

        this.items.forEach(({ data: anchor, items }) => {
            const item = new ListItem(anchor.title, anchor.url)
                .appendTo(this.list.element)
                .setOnClick(() => {
                    navigate(anchor.url, RequestHandler.REMOVE)
                })
            items.push(item)
        })
    }

    filterList(item: T_Bookmark, keyword: string): boolean {
        return item.title.toLowerCase().includes(keyword)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Anchors()
})
