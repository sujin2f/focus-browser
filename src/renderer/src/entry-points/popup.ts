import { A_ListSearch } from '@src/renderer/src/entry-points/abstracts/abs-list-search'
/* Utils */
import { checkElectron, ipcRenderer } from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { H1 } from '@src/renderer/src/template-parts/h1'
import { BackButton } from '@src/renderer/src/template-parts/back-button'
import { ListItem } from '@src/renderer/src/template-parts/list-item'
/* CONSTANTS */
import { EMOJI, IPC_CHANNELS, REQUEST_HANDLER } from '@src/common/constants'
/* T_Types */
import type { PopupBlocker } from '@src/common/types'

class Popup extends A_ListSearch<PopupBlocker> {
    constructor() {
        super()
        this.requestInfo('title', 'url')
        this.requestPopupBlockers()

        // Title
        const h1 = new H1(`Popup Blocker ${EMOJI.POPUP_BLOCKER}`).prependTo(
            'title',
        )
        new BackButton().prependTo(h1.element)
    }

    private requestPopupBlockers(): void {
        ipcRenderer.send(IPC_CHANNELS.POPUP_BLOCKER, REQUEST_HANDLER.REQUEST)

        ipcRenderer.on(
            IPC_CHANNELS.POPUP_BLOCKER,
            (handler, hosts = [[], []]) => {
                switch (handler) {
                    case REQUEST_HANDLER.RESPONSE:
                        this.handleResponse(hosts)
                        return
                    case REQUEST_HANDLER.RESPONSE_SUCCESS:
                        this.handleResponse(hosts)
                        // TODO
                        // this.notification.info('History cleared successfully!')
                        return
                    case REQUEST_HANDLER.RESPONSE_FAIL:
                        // this.notification.info('History cleared failed!')
                        return
                }
            },
        )
    }

    private handleResponse(hosts: [string[], string[]]) {
        this.items = []
        hosts[1].forEach((host) =>
            this.items.push({
                data: { host, allowed: true },
                items: [],
            }),
        )
        hosts[0].forEach((host) =>
            this.items.push({
                data: { host, allowed: false },
                items: [],
            }),
        )

        if (this.searchKeyword) {
            this.filterSearch()
        } else {
            this.renderList()
        }
    }

    renderList() {
        super.renderList()

        this.items.forEach(({ data: popup, items }) => {
            const content = `${popup.allowed ? `${EMOJI.CHECKED} ` : ''}${popup.host}`
            const item = new ListItem(content)
                .appendTo(this.list.element)
                .setOnClick(() => {
                    ipcRenderer.send(
                        IPC_CHANNELS.POPUP_BLOCKER,
                        REQUEST_HANDLER.MODIFY,
                        [[popup.host], []],
                    )
                })
            items.push(item)
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
