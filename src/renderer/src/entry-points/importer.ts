import { A_List } from '@home/entry-points/abstracts/abs-list'
/* Utils */
import {
    checkElectron,
    getSection,
    ipcRenderer,
    navigate,
} from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { Title } from '@home/template-parts/modules/title'
import { Loading } from '@home/template-parts/loading'
import { ListItem } from '@home/template-parts/list-item'
import { Notification } from '@home/template-parts/notification'
import { UserInfo } from '@home/template-parts/user-info'
/* CONSTANTS */
import {
    EMOJI,
    IPC_CHANNELS,
    Menu,
    REQUEST_HANDLER,
    SUJINC_URL,
} from '@src/common/constants'
/* T_Types */
import type { T_Cloud_Item } from '@src/common/types'
/* Models */
import { Logger } from '@src/common/logger'

class Importer extends A_List<T_Cloud_Item> {
    private notification: Notification = new Notification().appendTo('root')
    private loading = new Loading().appendTo('loading').hide()
    private bookmarks: string[] = []
    private anchors: string[] = []
    protected setEnabled(enabled: boolean) {
        super.setEnabled(enabled)
        if (enabled) {
            this.loading.hide()
        } else {
            this.loading.show()
        }
    }

    constructor() {
        super()
        this.requestStatus('userInfo')
        this.request()

        new Title(`Importer ${EMOJI.CLOUD}`)
        getSection('list').classList.add('list--cloud-items')
    }

    protected callbackUpdateStatus(): void {
        const userInfo = new UserInfo()

        if (this.settings.userInfo) {
            const user = JSON.parse(this.settings.userInfo)
            userInfo.picture = user.picture
            return
        }

        userInfo.loggedOut()
        getSection('login-alert').classList.remove('hidden')
        getSection('login-alert')
            .querySelector('button')
            ?.addEventListener('click', () => navigate(SUJINC_URL))
    }

    private request(): void {
        this.setEnabled(false)

        this.bookmarkStore.ready(() =>
            this.bookmarkStore.getAll((bookmarks) =>
                this.bookmarks.push(
                    ...bookmarks
                        .filter((item) => !item.dir)
                        .map((item) => item.url),
                ),
            ),
        )

        this.anchorStore.ready(() =>
            this.anchorStore.getAll((anchors) =>
                this.anchors.push(...anchors.map((item) => item.url)),
            ),
        )

        ipcRenderer.send(IPC_CHANNELS.CLOUD, REQUEST_HANDLER.REQUEST)
        ipcRenderer.once(IPC_CHANNELS.CLOUD_RESPONSE, (handler, items = []) => {
            switch (handler) {
                case REQUEST_HANDLER.RESPONSE:
                    this.items = items.map((item) => ({
                        data: item,
                        items: [] as ListItem[],
                    }))
                    this.render()
                    this.setEnabled(true)
                    return
            }
        })

        ipcRenderer.on(IPC_CHANNELS.CLOUD, (handler, response) => {
            this.setEnabled(true)
            switch (handler) {
                case REQUEST_HANDLER.RESPONSE_SUCCESS:
                    // TODO Fail
                    if (!response?.item) return
                    this.items = this.items
                        .filter((item) => item.data._id !== response.item!._id)
                        .map((item) => ({ ...item, items: [] as ListItem[] }))
                    this.render()
                    this.notification.info(`The bookmark is imported.`)
                    return
                case REQUEST_HANDLER.RESPONSE_FAIL:
                    Logger.init().error(response)
                    if (response?.message)
                        this.notification.error(response.message)
                    return
            }
        })
    }

    private render() {
        this.list.element.innerHTML = ''
        // Create & Assign ListItems
        this.items.forEach(({ data }) => {
            new ListItem(EMOJI[Menu.ADD_BOOKMARK]).appendTo(this.list.element)
            new ListItem(data.device || '').appendTo(this.list.element)
            new ListItem(data.title)
                .appendTo(this.list.element)
                .on('click', () => {
                    const bookmark = JSON.parse(data.message!)
                    navigate(bookmark.url)
                })

            // Context
            const enabled = this.getEnabled(data)
            new ListItem(enabled.length ? EMOJI.MENU : '')
                .appendTo(this.list.element)
                .on('click', (e) => this.showContextMenu(e, data))
                .on('contextmenu', (e) => this.showContextMenu(e, data))
        })
    }

    private getEnabled(item: T_Cloud_Item) {
        const enabled: string[] = []
        if (!this.bookmarks.includes(item.key)) enabled.push('bookmark')
        if (!this.anchors.includes(item.key)) enabled.push('anchor')
        return enabled
    }

    private showContextMenu(e: PointerEvent, item: T_Cloud_Item) {
        e.preventDefault()
        ipcRenderer.send(IPC_CHANNELS.CONTEXT, REQUEST_HANDLER.EXECUTE, {
            x: e.x,
            y: e.y,
            type: 'cloud',
            item,
            enabled: this.getEnabled(item),
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Importer()
})
