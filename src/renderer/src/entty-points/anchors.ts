import { A_List } from '@src/renderer/src/entty-points/abs-list'
/* Utils */
import {
    checkElectron,
    ipcRenderer,
    navigate,
    getSection,
} from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { H1 } from '@src/renderer/src/template-parts/h1'
import { BackButton } from '@src/renderer/src/template-parts/back-button'
import { ListRow } from '@src/renderer/src/template-parts/list-row'
/* CONSTANTS */
import { IPC_CHANNELS, RequestHandler } from '@src/common/constants'
/* T_Types */
import type { T_Bookmark } from '@src/common/types'

class Anchors extends A_List<T_Bookmark> {
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

            this.items = args[1] as T_Bookmark[]
            this.listItems = this.items
            this.renderList()
        })
    }

    renderList() {
        getSection('list').innerHTML = ''
        this.listItems.forEach((anchor) => {
            new ListRow(anchor.title, anchor.url)
                .appendTo('list')
                .setOnClick(() => {
                    navigate(anchor.url, RequestHandler.REMOVE)
                })
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
