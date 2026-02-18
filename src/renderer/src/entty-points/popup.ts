import { A_ListSearch } from '@src/renderer/src/entty-points/abs-list-search'
/* Utils */
import { checkElectron, ipcRenderer, getSection } from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { H1 } from '@src/renderer/src/template-parts/h1'
import { BackButton } from '@src/renderer/src/template-parts/back-button'
import { ListItem } from '@src/renderer/src/template-parts/list-item'
/* CONSTANTS */
import { IPC_CHANNELS, RequestHandler } from '@src/common/constants'
/* T_Types */
import type { PopupBlocker } from '@src/common/types'

class Popup extends A_ListSearch<PopupBlocker> {
    constructor() {
        super()
        this.requestInfo('title', 'url')
        this.requestPopupBlockers()

        // Title
        const h1 = new H1('Popup Blocker 👮').prependTo('title')
        new BackButton().prependTo(h1.element)
    }

    private requestPopupBlockers(): void {
        ipcRenderer.send(IPC_CHANNELS.POPUP_BLOCKER, RequestHandler.REQUEST)

        ipcRenderer.on(IPC_CHANNELS.POPUP_BLOCKER, (...args: unknown[]) => {
            const handler = args[0] as RequestHandler
            if (handler !== RequestHandler.RESPONSE) {
                return
            }

            this.items = []
            this.listItems = []

            const blocked = args[1] as string[]
            const allowed = args[2] as string[]

            allowed.forEach((host) => this.items.push({ host, allowed: true }))
            blocked.forEach((host) => this.items.push({ host, allowed: false }))

            this.listItems = this.items

            if (this.searchKeyword) {
                this.filterSearch()
            } else {
                this.renderList()
            }
        })
    }

    renderList() {
        getSection('list').innerHTML = ''
        this.listItems.forEach((item) => {
            const content = `${item.allowed ? '✅ ' : ''}${item.host}`
            new ListItem(content).appendTo(this.list.element).setOnClick(() => {
                ipcRenderer.send(
                    IPC_CHANNELS.POPUP_BLOCKER,
                    RequestHandler.MODIFY,
                    item.host,
                )
            })
        })
    }

    filterList(item: PopupBlocker, keyword: string): boolean {
        return item.host.toLowerCase().includes(keyword)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Popup()
})
