import { A_ListCloudPush } from '@home/entry-points/abstracts/abs-list-cloud-push'
/* Utils */
import { checkElectron, ipcRenderer } from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { Title } from '@home/template-parts/modules/title'
import { Button } from '@home/template-parts/button'
import { ListItem } from '@home/template-parts/list-item'
import { UserInfo } from '@home/template-parts/user-info'
import { ButtonCloudPush } from '@home/template-parts/modules/button-cloud-push'
import { Notification } from '@home/template-parts/notification'
/* CONSTANTS */
import { EMOJI, IPC_CHANNELS, REQUEST_HANDLER } from '@src/common/constants'
/* T_Types */
import type { T_Bookmark } from '@src/common/types'

class History extends A_ListCloudPush<T_Bookmark> {
    public notification: Notification = new Notification().appendTo('root')
    private btnClear: Button
    // (En/Dis)able
    protected setEnabled(enabled: boolean) {
        super.setEnabled(enabled)
        if (enabled) {
            this.btnClear.enable()
        } else {
            this.btnClear.disable()
        }
    }

    constructor() {
        super('list--history')
        this.requestStatus('userInfo')
        this.request()

        // Title
        new Title(`History ${EMOJI.HISTORY}`)

        // Clear History
        this.btnClear = new Button('Clear History')
            .prependTo('buttons')
            .setOnClick(() => {
                this.setEnabled(false)
                ipcRenderer.send(IPC_CHANNELS.HISTORY, REQUEST_HANDLER.REMOVE)
            })
            .disable()
    }

    /**
     * User updated
     */
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
            this.setEnabled(true)

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

        this.list.element.innerHTML = ''

        const reversed = this.items.reverse()
        const length = this.items.length

        reversed.forEach(({ data: history, items }, index) => {
            const item = new ListItem(history.title, history.url)
                .appendTo(this.list.element)
                .setOnClick(() => {
                    if (!this.enabled) {
                        return
                    }
                    this.setEnabled(false)
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
            const button = new ButtonCloudPush(
                {
                    title: history.title,
                    key: history.url,
                    type: 'bookmark',
                    message: JSON.stringify(history),
                },
                () => this.settings.userInfo,
                (button: ButtonCloudPush) => {
                    const enabled = this.enabled
                    if (enabled) {
                        this.callbackCloudPush(button)
                    }
                    return enabled
                },
            )
            const send = new ListItem(button).appendTo(this.list.element)
            send.clickable = false

            items.push(item, send)
        })
    }

    protected filterList(item: T_Bookmark, keyword: string): boolean {
        return item.title.toLowerCase().includes(keyword)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new History()
})
