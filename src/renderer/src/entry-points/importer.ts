import { A_List } from '@home/entry-points/abstracts/abs-list'
/* Utils */
import { checkElectron, getSection, ipcRenderer, navigate } from '@home/utils'
/* <HTML template-part /> */
import { H1 } from '@home/template-parts/h1'
import { BackButton } from '@home/template-parts/back-button'
import { Loading } from '@home/template-parts/loading'
import { ListItem } from '@home/template-parts/list-item'
import { Notification } from '@home/template-parts/notification'
import { UserInfo } from '@home/template-parts/user-info'
/* CONSTANTS */
import {
    BROWSER,
    EMOJI,
    IPC_CHANNELS,
    Menu,
    REQUEST_HANDLER,
    SUJINC_URL,
} from '@src/common/constants'
/* T_Types */
import type { T_Cloud_Item } from '@src/common/types'

class Importer extends A_List<T_Cloud_Item> {
    private notification: Notification = new Notification().appendTo('root')
    private loading = new Loading().appendTo('loading').hide()
    private enable = false
    private keys: string[] = []

    constructor() {
        super()
        this.requestStatus('userInfo')
        this.request()

        // Title
        const h1 = new H1(`Importer ${EMOJI.CLOUD}`).prependTo('title')
        new BackButton().prependTo(h1.element)

        getSection('list').classList.add('list--cloud-items')
    }

    protected callbackUpdateStatus(): void {
        const userInfo = new UserInfo()
        if (this.settings.userInfo) {
            const user = JSON.parse(this.settings.userInfo)
            userInfo.picture = user.picture
        } else {
            userInfo.loggedOut()
            getSection('login-alert').classList.remove('hidden')
            getSection('login-alert')
                .querySelector('button')
                ?.addEventListener('click', () => {
                    navigate({
                        scene: BROWSER,
                        address: SUJINC_URL,
                    })
                })
        }
    }

    private request(): void {
        this.loading.show()
        ipcRenderer.send(IPC_CHANNELS.BOOKMARK, REQUEST_HANDLER.REQUEST)
        ipcRenderer.once(IPC_CHANNELS.BOOKMARK, (handler, items = []) => {
            switch (handler) {
                case REQUEST_HANDLER.RESPONSE:
                    this.enable = true
                    this.keys.push(...items.map((item) => item.url))
                    return
            }
        })

        ipcRenderer.send(IPC_CHANNELS.CLOUD, REQUEST_HANDLER.REQUEST)
        ipcRenderer.on(IPC_CHANNELS.CLOUD, (handler, items = []) => {
            this.loading.hide()

            switch (handler) {
                case REQUEST_HANDLER.RESPONSE:
                    this.enable = true
                    this.items = items.map((item) => ({
                        data: item,
                        items: [] as ListItem[],
                    }))
                    this.renderList()
                    return
                case REQUEST_HANDLER.RESPONSE_SUCCESS:
                    this.enable = true
                    this.items = this.items.filter(
                        (item) => item.data._id !== items[0]._id,
                    )
                    this.renderList()
                    this.notification.info(items[0].title)
                    return
                case REQUEST_HANDLER.RESPONSE_FAIL:
                    this.enable = true
                    if (items[0]._id) {
                        this.items = this.items.filter(
                            (item) => item.data._id !== items[0]._id,
                        )
                    }
                    this.notification.error(items[0].title)
                    return
            }
        })
    }

    renderList() {
        super.renderList()
        const list = getSection('list')

        // Create & Assign ListItems
        this.items.forEach(({ data }) => {
            const device = new ListItem(data.device || '')
            const row = new ListItem(data.title).setOnClick(() => {
                if (!this.enable) {
                    return
                }
                ipcRenderer.send(IPC_CHANNELS.CLOUD, REQUEST_HANDLER.ADD, [
                    data,
                ])
                this.enable = false
            })
            const icon = new ListItem(
                data.type === 'bookmark' ? EMOJI[Menu.ADD_BOOKMARK] : '',
            )
            icon.appendTo(list)
            device.appendTo(list)
            row.appendTo(list)
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Importer()
})
