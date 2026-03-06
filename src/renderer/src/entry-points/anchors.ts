import { A_ListCloudPush } from '@home/entry-points/abstracts/abs-list-cloud-push'
/* Utils */
import { checkElectron, ipcRenderer, navigate } from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { Title } from '@home/template-parts/modules/title'
import { ListItem } from '@home/template-parts/list-item'
import { UserInfo } from '@home/template-parts/user-info'
/* CONSTANTS */
import {
    EMOJI,
    IPC_CHANNELS,
    Menu,
    REQUEST_HANDLER,
} from '@src/common/constants'
/* T_Types */
import type { T_Anchor } from '@src/common/types/store'
import { Logger } from '@src/common/logger'

class Anchors extends A_ListCloudPush<T_Anchor> {
    constructor() {
        super('list--anchors')
        this.requestStatus('userInfo')
        this.initStore()

        new Title(`Anchors ${EMOJI[Menu.ADD_ANCHOR]}`)
    }

    private initStore() {
        this.anchorStore.ready(() => {
            this.anchorStore.getAll((anchors) => {
                if (!anchors || !anchors.length) {
                    this.requestAnchors()
                    return
                }

                this.arrangeAnchors(anchors.reverse())
            })
        })
    }

    private arrangeAnchors(anchors: T_Anchor[]) {
        this.items = []

        anchors.forEach((anchor) =>
            this.items.push({ data: anchor, items: [] }),
        )

        this.renderList()
        this.setEnabled(true)
    }

    protected filterList(item: T_Anchor, keyword: string): boolean {
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
                this.anchorStore.add(reverse, () =>
                    this.anchorStore.getAll((anchors) =>
                        this.arrangeAnchors(anchors),
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
                    .on('click', () => {
                        if (this.enabled && anchor.uid) {
                            this.anchorStore.remove(anchor.uid, () =>
                                navigate(anchor.url),
                            )
                        }
                    })

                // Context
                const context = new ListItem(EMOJI.MENU)
                    .appendTo(this.list.element)
                    .on('click', (e) => this.showContextMenu(e, anchor))
                    .on('contextmenu', (e) => this.showContextMenu(e, anchor))

                items.push(icon, title, context)
            })
    }

    private showContextMenu(e: PointerEvent, item: T_Anchor) {
        e.preventDefault()

        const enabled: string[] = ['remove', 'bookmark']
        if (!this.hasCloudItem.has(item.url)) enabled.push('cloud')
        this.currentUrl = item.url

        ipcRenderer.send(IPC_CHANNELS.CONTEXT, REQUEST_HANDLER.EXECUTE, {
            x: e.x,
            y: e.y,
            type: 'anchor',
            item,
            enabled,
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Anchors()
})
