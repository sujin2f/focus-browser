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
    EMOJI,
    IPC_CHANNELS,
    Menu,
    REQUEST_HANDLER,
    BROWSER,
    SUJINC_URL,
} from '@src/common/constants'
/* T_Types */
import type { T_Bookmark } from '@src/common/types'

class Anchors extends A_ListSearch<T_Bookmark> {
    private notification: Notification = new Notification().appendTo('root')

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
        ipcRenderer.on(IPC_CHANNELS.BOOKMARK, (handler, anchors = []) => {
            switch (handler) {
                case REQUEST_HANDLER.RESPONSE_FAIL:
                    this.notification.error(anchors[0].title)
                    return
                case REQUEST_HANDLER.PUT:
                    this.notification.info(anchors[0].title)
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
                        [anchor],
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
    new Anchors()
})
