import { A_ListCloudPush } from '@home/entry-points/abstracts/abs-list-cloud-push'
/* Utils */
import { checkElectron, ipcRenderer } from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { Title } from '@home/template-parts/modules/title'
import { Button } from '@home/template-parts/button'
import { ListItem } from '@home/template-parts/list-item'
import { UserInfo } from '@home/template-parts/user-info'
import { Notification } from '@home/template-parts/notification'
/* CONSTANTS */
import { EMOJI, IPC_CHANNELS, REQUEST_HANDLER } from '@src/common/constants'
/* T_Types */
import type { T_Bookmark } from '@src/common/types/store'

class History extends A_ListCloudPush<T_Bookmark> {
    public notification: Notification = new Notification().appendTo('root')
    private btnClear: Button
    private bookmarks: string[] = []
    private anchors: string[] = []
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

        new Title(`History ${EMOJI.HISTORY}`)

        this.btnClear = new Button(`${EMOJI.TRASH} Clear History`)
            .prependTo('buttons')
            .on('click', () => {
                this.setEnabled(false)
                ipcRenderer.send(IPC_CHANNELS.CLEANER, REQUEST_HANDLER.REMOVE, {
                    request: 'history',
                })
                ipcRenderer.once(IPC_CHANNELS.CLEANER, (handler) => {
                    if (handler !== REQUEST_HANDLER.RESPONSE_SUCCESS) return
                    this.render([])
                    this.notification.info('History cleared successfully!')
                })
            })
            .disable()
    }

    /**
     * User updated
     */
    protected callbackUpdateStatus(): void {
        const userInfo = new UserInfo()
        if (!this.settings.userInfo) {
            userInfo.loggedOut()
            return
        }
        const user = JSON.parse(this.settings.userInfo)
        userInfo.picture = user.picture
    }

    private request(): void {
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

        ipcRenderer.send(IPC_CHANNELS.HISTORY, REQUEST_HANDLER.REQUEST)
        ipcRenderer.on(IPC_CHANNELS.HISTORY, (handler, history = []) => {
            this.setEnabled(true)
            if (handler !== REQUEST_HANDLER.RESPONSE) return
            if (Array.isArray(history)) this.render(history)
        })
    }

    private render(history: T_Bookmark[]) {
        this.list.element.innerHTML = ''

        this.items = history.map((bookmark) => ({
            data: bookmark,
            items: [] as ListItem[],
        }))

        this.items.forEach(({ data: history, items }, index) => {
            const enabled = this.getEnabled(history)
            const context = enabled.length
                ? new ListItem(EMOJI.MENU)
                      .prependTo(this.list.element)
                      .on('click', (e) => this.showContextMenu(e, history))
                      .on('contextmenu', (e) =>
                          this.showContextMenu(e, history),
                      )
                : new ListItem('')

            const item = new ListItem(history.title, history.url)
                .prependTo(this.list.element)
                .on('click', () => {
                    if (!this.enabled) return
                    this.setEnabled(false)
                    ipcRenderer.send(
                        IPC_CHANNELS.HISTORY,
                        REQUEST_HANDLER.EXECUTE,
                        index,
                    )
                })

            const icon = this.getFaviconColumn(history.url).prependTo(
                this.list.element,
            )

            items.push(context, item, icon)
        })
    }

    private getEnabled(item: T_Bookmark) {
        const enabled: string[] = []
        if (!this.bookmarks.includes(item.url)) enabled.push('bookmark')
        if (!this.anchors.includes(item.url)) enabled.push('anchor')
        if (!this.hasCloudItem.has(item.url)) enabled.push('cloud')
        return enabled
    }

    private showContextMenu(e: PointerEvent, item: T_Bookmark) {
        e.preventDefault()
        this.currentUrl = ''

        const enabled = this.getEnabled(item)
        if (!enabled.length) return

        this.currentUrl = item.url

        ipcRenderer.send(IPC_CHANNELS.CONTEXT, REQUEST_HANDLER.EXECUTE, {
            x: e.x,
            y: e.y,
            type: 'history',
            item,
            enabled,
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
