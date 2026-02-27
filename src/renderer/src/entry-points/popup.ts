import { A_ListSearch } from '@home/entry-points/abstracts/abs-list-search'
/* Utils */
import { checkElectron, ipcRenderer } from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { Title } from '@home/template-parts/modules/title'
import { ListItem } from '@home/template-parts/list-item'
/* CONSTANTS */
import { EMOJI, IPC_CHANNELS, REQUEST_HANDLER } from '@src/common/constants'
/* T_Types */
import type { PopupBlocker } from '@src/common/types'

class Popup extends A_ListSearch<PopupBlocker> {
    constructor() {
        super()
        this.requestStatus('title', 'url')
        this.requestPopupBlockers()

        // Title
        new Title(`Popup Blocker ${EMOJI.POPUP_BLOCKER}`)
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

    protected filterList(item: PopupBlocker, keyword: string): boolean {
        return item.host.toLowerCase().includes(keyword)
    }

    private renderList() {
        this.list.element.innerHTML = ''

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
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Popup()
})
