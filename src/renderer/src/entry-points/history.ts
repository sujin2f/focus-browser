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
import { IPC_CHANNELS, RequestHandler } from '@src/common/constants'
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
        const h1 = new H1('History 📝').prependTo('title')
        new BackButton().prependTo(h1.element)

        // Clear History
        this.button = new Button('Clear History')
            .prependTo('buttons')
            .setOnClick(() => {
                this.button.disable()
                ipcRenderer.send(IPC_CHANNELS.HISTORY, RequestHandler.REMOVE)

                ipcRenderer.once(IPC_CHANNELS.HISTORY, (...args: unknown[]) => {
                    const handler = args[0] as RequestHandler
                    if (handler !== RequestHandler.RESULT) {
                        return
                    }

                    this.button.enable()
                    this.items = (args[1] as T_Bookmark[]).map((bookmark) => ({
                        data: bookmark,
                        items: [] as ListItem[],
                    }))

                    this.renderList()
                    this.notification.info('History cleared successfully!')
                })
            })
    }

    private request(): void {
        ipcRenderer.send(IPC_CHANNELS.HISTORY, RequestHandler.REQUEST)

        ipcRenderer.once(IPC_CHANNELS.HISTORY, (...args: unknown[]) => {
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

    renderList() {
        super.renderList()

        this.items.forEach(({ data: history, items }, index) => {
            const item = new ListItem(history.title, history.url)
                .appendTo(this.list.element)
                .setOnClick(() => {
                    ipcRenderer.send(
                        IPC_CHANNELS.HISTORY,
                        RequestHandler.EXECUTE,
                        index,
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
