import { A_ListSearch } from '@src/renderer/src/entry-points/abstracts/abs-list-search'
/* Utils */
import {
    checkElectron,
    getSection,
    ipcRenderer,
    navigate,
} from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { H1 } from '@src/renderer/src/template-parts/h1'
import { BackButton } from '@src/renderer/src/template-parts/back-button'
import { Button } from '@src/renderer/src/template-parts/button'
import { ListItem } from '@src/renderer/src/template-parts/list-item'
import { UserInfo } from '@src/renderer/src/template-parts/user-info'
import { Notification } from '@src/renderer/src/template-parts/notification'
/* CONSTANTS */
import {
    BROWSER,
    EMOJI,
    IPC_CHANNELS,
    REQUEST_HANDLER,
    SUJINC_URL,
} from '@src/common/constants'
/* T_Types */
import type { T_Bookmark } from '@src/common/types'

class History extends A_ListSearch<T_Bookmark> {
    private notification: Notification = new Notification().appendTo('root')
    private button: Button

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
        ipcRenderer.on(IPC_CHANNELS.BOOKMARK, (handler, history = []) => {
            this.button.enable()
            switch (handler) {
                case REQUEST_HANDLER.RESPONSE_FAIL:
                    this.notification.error(history[0].title)
                    return
                case REQUEST_HANDLER.PUT:
                    this.notification.info(history[0].title)
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
                    if (!this.settings.userInfo) {
                        getSection('login-alert').classList.remove('hidden')
                        getSection('login-alert')
                            .querySelector('button')
                            ?.addEventListener('click', () => {
                                navigate({
                                    scene: BROWSER,
                                    address: SUJINC_URL,
                                })
                            })
                        return
                    }

                    ipcRenderer.send(
                        IPC_CHANNELS.BOOKMARK,
                        REQUEST_HANDLER.PUT,
                        [
                            {
                                id: '',
                                title: history.title,
                                url: history.url,
                            } satisfies T_Bookmark,
                        ],
                    )
                }),
            ).appendTo(this.list.element)
            send.clickable = false

            items.push(item, send)
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
