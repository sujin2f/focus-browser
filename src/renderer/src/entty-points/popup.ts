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
import type { PopupBlocker } from '@src/common/types'

class Popup extends A_List<PopupBlocker> {
    constructor() {
        super()
        this.requestInfo('helpText', 'title', 'url')
        this.requestPopupBlockers()

        // Title
        const h1 = new H1('Popup Blocker 👮').prependTo('title')
        new BackButton().prependTo(h1.element)
    }

    private requestPopupBlockers(): void {
        ipcRenderer.send(IPC_CHANNELS.POPUP_BLOCKER, RequestHandler.REQUEST)

        ipcRenderer.once(IPC_CHANNELS.POPUP_BLOCKER, (...args: unknown[]) => {
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

            this.renderList()
        })
    }

    renderList() {
        getSection('list').innerHTML = ''
        this.listItems.forEach((item) => {
            new ListRow(item.host).appendTo('list').setOnClick(() => {
                // TODO
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
