import { A_List } from '@home/entry-points/abstracts/abs-list'
import { A_TraitCloudPush } from '@home/entry-points/abstracts/abs-list-cloud-push'
import { A_TraitSearch } from '@home/entry-points/abstracts/abs-list-search'
/* Models */
import { Logger } from '@src/renderer/logger'
/* Utils */
import { checkElectron, ipcRenderer, navigate } from '@home/utils'
/* <HTML template-part /> */
import { H1 } from '@home/template-parts/h1'
import { BackButton } from '@home/template-parts/back-button'
import { Button } from '@home/template-parts/button'
import { ListItem } from '@home/template-parts/list-item'
import { UserInfo } from '@home/template-parts/user-info'
import { Notification } from '@home/template-parts/notification'
/* CONSTANTS */
import {
    EMOJI,
    IPC_CHANNELS,
    Menu,
    REQUEST_HANDLER,
} from '@src/common/constants'
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

class Anchors extends A_List<T_Bookmark> {
    public notification: Notification = new Notification().appendTo('root')

    // Search
    private search = new Search(this)
    protected callbackShortcut(e: KeyboardEvent) {
        this.search.callbackShortcut(e)
    }
    // Push
    private cloud = new CloudPush(this, this.notification)

    constructor() {
        super('list--anchors')
        this.requestStatus('userInfo')
        this.requestAnchors()

        // Title
        const h1 = new H1(`Anchors ${EMOJI[Menu.ADD_ANCHOR]}`).prependTo(
            'title',
        )
        new BackButton().prependTo(h1.element)
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

    private requestAnchors(): void {
        ipcRenderer.send(IPC_CHANNELS.ANCHOR, REQUEST_HANDLER.REQUEST)
        ipcRenderer.once(IPC_CHANNELS.ANCHOR, (handler, anchors = []) => {
            switch (handler) {
                case REQUEST_HANDLER.RESPONSE:
                    this.items = anchors.map((bookmark) => ({
                        data: bookmark,
                        items: [] as ListItem[],
                    }))
                    this.renderList()
                    return
            }
        })
    }

    protected renderList() {
        super.renderList()

        this.items.forEach(({ data: anchor, items }) => {
            const item = new ListItem(anchor.title, anchor.url)
                .appendTo(this.list.element)
                .setOnClick(() => {
                    navigate({ address: anchor.url }, REQUEST_HANDLER.REMOVE)
                })

            // Cloud
            const send = new ListItem(
                new Button(EMOJI.GLOBE, 'button-clear').setOnClick(() => {
                    this.cloud.sendCloudPush(anchor)
                }),
            ).appendTo(this.list.element)
            send.clickable = false

            items.push(item, send)
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Anchors()
})
