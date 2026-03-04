import { A_ListCloudPush } from '@home/entry-points/abstracts/abs-list-cloud-push'
/* Utils */
import { checkElectron, ipcRenderer, navigate } from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { Title } from '@home/template-parts/modules/title'
import { ListItem } from '@home/template-parts/list-item'
import { UserInfo } from '@home/template-parts/user-info'
/* CONSTANTS */
import {
    BOOKMARK_TYPES,
    EMOJI,
    IPC_CHANNELS,
    Menu,
    REQUEST_HANDLER,
} from '@src/common/constants'
/* T_Types */
import type { T_Bookmark } from '@src/common/types/store'
import { Logger } from '@src/common/logger'

class Anchors extends A_ListCloudPush<T_Bookmark> {
    constructor() {
        super('list--anchors')
        this.requestStatus('userInfo')
        this.initStore()

        new Title(`Anchors ${EMOJI[Menu.ADD_ANCHOR]}`)
    }

    private initStore() {
        this.bookmarkStore.ready(() => {
            this.bookmarkStore.getAll(BOOKMARK_TYPES.ANCHOR, (anchors) => {
                if (!anchors || !anchors.length) {
                    this.requestAnchors()
                    return
                }

                this.arrangeAnchors(anchors.reverse())
            })
        })
    }

    private arrangeAnchors(anchors: T_Bookmark[]) {
        this.items = []

        anchors.forEach((anchor) =>
            this.items.push({ data: anchor, items: [] }),
        )

        this.renderList()
        this.setEnabled(true)
    }

    protected filterList(item: T_Bookmark, keyword: string): boolean {
        return item.title.toLowerCase().includes(keyword)
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

    /**
     * @deprecated
     */
    private requestAnchors(): void {
        ipcRenderer.send(IPC_CHANNELS.ANCHOR, REQUEST_HANDLER.REQUEST)
        ipcRenderer.once(IPC_CHANNELS.ANCHOR, (_, anchors = []) => {
            Logger.init().info(anchors)
            if (anchors && Array.isArray(anchors)) {
                const reverse = [...anchors].reverse()
                this.bookmarkStore.add(reverse, () =>
                    this.bookmarkStore.getAll(
                        BOOKMARK_TYPES.ANCHOR,
                        (anchors) => this.arrangeAnchors(anchors),
                    ),
                )
            }
        })
    }

    private renderList() {
        this.list.element.innerHTML = ''

        this.items
            .filter((item) => item.data.url && item.data.title)
            .forEach(({ data: anchor, items }) => {
                const icon = this.getFaviconColumn(anchor.url).appendTo(
                    this.list.element,
                )

                const title = new ListItem(anchor.title, anchor.url)
                    .appendTo(this.list.element)
                    .setOnClick(() => {
                        if (this.enabled && anchor.uid) {
                            this.bookmarkStore.remove(anchor.uid, () =>
                                navigate(anchor.url),
                            )
                        }
                    })
                    .addClass('list--bookmarks__title')

                // Cloud
                const button = this.createCloudPushButton({
                    title: anchor.title,
                    key: anchor.url,
                    type: 'bookmark',
                    message: JSON.stringify(anchor),
                })
                const send = new ListItem(button).appendTo(this.list.element)
                send.clickable = false

                items.push(icon, title, send)
            })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Anchors()
})
