import { A_ListSearch } from '@src/renderer/src/entry-points/abstracts/abs-list-search'
/* Utils */
import { checkElectron, ipcRenderer } from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { H1 } from '@src/renderer/src/template-parts/h1'
import { BackButton } from '@src/renderer/src/template-parts/back-button'
import { Button } from '@src/renderer/src/template-parts/button'
import { ListItem } from '@src/renderer/src/template-parts/list-item'
import { Notification } from '@src/renderer/src/template-parts/notification'
/* CONSTANTS */
import { EMOJI, IPC_CHANNELS, REQUEST_HANDLER } from '@src/common/constants'
/* T_Types */
import type { T_Bookmark } from '@src/common/types'

class History extends A_ListSearch<T_Bookmark> {
    private notification: Notification = new Notification().appendTo('root')
    private button: Button

    constructor() {
        super()
        this.requestInfo('title', 'url')
        this.request()

        // Title
        const h1 = new H1(`History ${EMOJI.HISTORY}`).prependTo('title')
        new BackButton().prependTo(h1.element)

        // Clear History
        this.button = new Button('Clear History')
            .prependTo('buttons')
            .setOnClick(() => {
                this.button.disable()
                ipcRenderer.send(IPC_CHANNELS.HISTORY, REQUEST_HANDLER.REMOVE)
            })
            .disable()
    }

    private request(): void {
        ipcRenderer.send(IPC_CHANNELS.HISTORY, REQUEST_HANDLER.REQUEST)
        ipcRenderer.on(IPC_CHANNELS.HISTORY, (handler, history = []) => {
            this.button.enable()
            switch (handler) {
                case REQUEST_HANDLER.RESPONSE:
                    this.handleResponse(history)
                    return
                case REQUEST_HANDLER.RESPONSE_SUCCESS:
                    this.handleResponse(history)
                    this.notification.info('History cleared successfully!')
                    return
                case REQUEST_HANDLER.RESPONSE_FAIL:
                    this.notification.info('History cleared failed!')
                    return
            }
        })
    }

    private handleResponse(history: T_Bookmark[]) {
        this.items = history.map((bookmark) => ({
            data: bookmark,
            items: [] as ListItem[],
        }))
        this.renderList()
    }

    renderList() {
        super.renderList()

        const reversed = this.items.reverse()
        const length = this.items.length

        reversed.forEach(({ data: history, items }, index) => {
            const item = new ListItem(history.title, history.url)
                .appendTo(this.list.element)
                .setOnClick(() => {
                    ipcRenderer.send(
                        IPC_CHANNELS.HISTORY,
                        REQUEST_HANDLER.EXECUTE,
                        [
                            {
                                id: (length - 1 - index).toString(),
                                url: '',
                                title: '',
                            },
                        ],
                    )
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
    new History()
})
