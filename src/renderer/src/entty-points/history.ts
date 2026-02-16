import { A_List } from '@src/renderer/src/entty-points/abs-list'
/* Utils */
import { checkElectron, ipcRenderer, getSection } from '@src/renderer/src/utils'
/* <HTML Fragments /> */
import { H1 } from '@src/renderer/src/fragments/h1'
import { BackButton } from '@src/renderer/src/fragments/back-button'
import { ListRow } from '@src/renderer/src/fragments/list-row'
/* CONSTANTS */
import { IPC_CHANNELS, RequestHandler } from '@src/common/constants'
/* T_Types */
import type { Bookmark } from '@src/common/types'

class History extends A_List<Bookmark> {
    constructor() {
        super()
        this.requestInfo('helpText', 'title', 'url')
        this.requestAnchors()

        // Title
        const h1 = new H1('History 📝').prependTo('title')
        new BackButton().prependTo(h1.element)
    }

    private requestAnchors(): void {
        ipcRenderer.send(IPC_CHANNELS.HISTORY, RequestHandler.REQUEST)

        ipcRenderer.once(IPC_CHANNELS.HISTORY, (...args: unknown[]) => {
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
        this.listItems.forEach((item, index) => {
            new ListRow(item.title, item.url)
                .prependTo('list')
                .setOnClick(() => {
                    ipcRenderer.send(
                        IPC_CHANNELS.HISTORY,
                        RequestHandler.EXECUTE,
                        index,
                    )
                })
        })
    }

    filterList(item: Bookmark, keyword: string): boolean {
        return item.title.toLowerCase().includes(keyword)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new History()
})
