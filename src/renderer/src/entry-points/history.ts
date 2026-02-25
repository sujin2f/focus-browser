import { A_List } from '@home/entry-points/abstracts/abs-list'
import { A_TraitCloudPush } from '@home/entry-points/abstracts/abs-list-cloud-push'
import { A_TraitSearch } from '@home/entry-points/abstracts/abs-list-search'
/* Models */
import { Logger } from '@src/renderer/logger'
/* Utils */
import { checkElectron, ipcRenderer } from '@home/utils'
/* <HTML template-part /> */
import { H1 } from '@home/template-parts/h1'
import { BackButton } from '@home/template-parts/back-button'
import { Button } from '@home/template-parts/button'
import { ListItem } from '@home/template-parts/list-item'
import { UserInfo } from '@home/template-parts/user-info'
import { Notification } from '@home/template-parts/notification'
/* CONSTANTS */
import { EMOJI, IPC_CHANNELS, REQUEST_HANDLER } from '@src/common/constants'
/* T_Types */
import type { T_Bookmark } from '@src/common/types'

class Search extends A_TraitSearch<T_Bookmark> {
    filterList(item: T_Bookmark, keyword: string): boolean {
        return item.title.toLowerCase().includes(keyword)
    }
}

class CloudPush extends A_TraitCloudPush<T_Bookmark> {
    public sendCloudPush(bookmark: T_Bookmark): boolean {
        if (!super.sendCloudPush(bookmark)) {
            return false
        }

        Logger.getInstance().log('Sending Bookmark to Cloud', bookmark.title)
        ipcRenderer.send(IPC_CHANNELS.CLOUD, REQUEST_HANDLER.PUT, [
            { title: bookmark.title, key: bookmark.url, type: 'bookmark' },
        ])
        return true
    }
}

class History extends A_List<T_Bookmark> {
    public notification: Notification = new Notification().appendTo('root')
    private button: Button
    // Search
    private search = new Search(this)
    protected callbackShortcut(e: KeyboardEvent) {
        this.search.callbackShortcut(e)
    }
    // Push
    private cloud = new CloudPush(this, this.notification)

    constructor() {
        super('list--history')
        this.requestStatus('userInfo')
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

    protected callbackUpdateStatus(): void {
        const userInfo = new UserInfo()
        if (this.settings.userInfo) {
            const user = JSON.parse(this.settings.userInfo)
            userInfo.picture = user.picture
        } else {
            userInfo.loggedOut()
        }
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

            // Cloud
            const send = new ListItem(
                new Button(EMOJI.GLOBE, 'button-clear').setOnClick(() => {
                    this.cloud.sendCloudPush(history)
                }),
            ).appendTo(this.list.element)
            send.clickable = false

            items.push(item, send)
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new History()
})
