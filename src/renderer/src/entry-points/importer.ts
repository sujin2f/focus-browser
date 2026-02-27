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
    BROWSER,
    EMOJI,
    IPC_CHANNELS,
    Menu,
    REQUEST_HANDLER,
    SUJINC_URL,
} from '@src/common/constants'
/* T_Types */
import type { T_Bookmark, T_Cloud_Item } from '@src/common/types'

class Importer extends A_List<T_Cloud_Item> {
    private notification: Notification = new Notification().appendTo('root')
    private loading = new Loading().appendTo('loading').hide()
    private keys: string[] = []
    private currentRow?: ListItem
    protected setEnabled(enabled: boolean) {
        super.setEnabled(enabled)
        if (enabled) {
            this.loading.hide()
            this.currentRow = undefined
        } else {
            this.loading.show()
        }
    }

    constructor() {
        super()
        this.requestStatus('userInfo')
        this.request()

        // Title
        new Title(`Importer ${EMOJI.CLOUD}`)

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
        this.setEnabled(false)
        ipcRenderer.send(IPC_CHANNELS.BOOKMARK, REQUEST_HANDLER.REQUEST)
        ipcRenderer.once(
            IPC_CHANNELS.BOOKMARKS_RESPONSE,
            (handler, response) => {
                if (response) {
                    // TODO
                    this.setEnabled(true)
                    const bookmarks = [
                        ...Object.values(response.dirs),
                        ...Object.values(response.items),
                    ]
                    this.keys.push(...bookmarks.map((item) => item.url))
                }
                this.setEnabled(true)
                ipcRenderer.send(IPC_CHANNELS.CLOUD, REQUEST_HANDLER.REQUEST)
            },
        )

        ipcRenderer.once(IPC_CHANNELS.CLOUD_RESPONSE, (handler, items = []) => {
            switch (handler) {
                case REQUEST_HANDLER.RESPONSE:
                    this.items = items.map((item) => ({
                        data: item,
                        items: [] as ListItem[],
                    }))
                    this.renderList()
                    this.setEnabled(true)
                    return
                case REQUEST_HANDLER.RESPONSE_SUCCESS:
                    this.items = this.items.filter(
                        (item) => item.data._id !== items[0]._id,
                    )
                    this.renderList()
                    this.notification.info(items[0].title)
                    this.setEnabled(true)
                    return
                case REQUEST_HANDLER.RESPONSE_FAIL:
                    if (items[0]._id) {
                        this.items = this.items.filter(
                            (item) => item.data._id !== items[0]._id,
                        )
                    }
                    this.notification.error(items[0].title)
                    this.setEnabled(true)
                    return
            }
        })
    }

    private renderList() {
        this.list.element.innerHTML = ''
        // Create & Assign ListItems
        this.items.forEach(({ data }) => {
            const device = new ListItem(data.device || '')
            const row = new ListItem(data.title)
            const icon = new ListItem(
                data.type === 'bookmark' ? EMOJI[Menu.ADD_BOOKMARK] : '',
            )

            icon.appendTo(this.list.element)
            device.appendTo(this.list.element)
            row.appendTo(this.list.element)

            if (this.keys.includes(data.key)) {
                row.element.classList.add('section-disabled')
            } else {
                row.setOnClick(() => {
                    if (!this.enabled) {
                        return
                    }
                    this.currentRow = row
                    ipcRenderer.send(
                        IPC_CHANNELS.CLOUD,
                        REQUEST_HANDLER.REMOVE,
                        { item: data },
                    )
                    ipcRenderer.send(
                        IPC_CHANNELS.BOOKMARK,
                        REQUEST_HANDLER.ADD,
                        {
                            item: {
                                id: 'from-cloud',
                                url: '',
                                title: data.message!,
                            } satisfies T_Bookmark,
                        },
                    )
                    this.setEnabled(false)
                })
            }
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Importer()
})
