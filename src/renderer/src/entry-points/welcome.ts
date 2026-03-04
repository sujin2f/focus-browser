import { A_List } from '@home/entry-points/abstracts/abs-list'
/* Utils */
import {
    checkElectron,
    navigate,
    ipcRenderer,
    commandSymbol,
} from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { H1 } from '@home/template-parts/h1'
import { H2 } from '@home/template-parts/h2'
import { Card } from '@home/template-parts/card'
import { UserInfo } from '@home/template-parts/user-info'
import { getAddressBar } from '@home/template-parts/modules/address-bar'
import { ListItem } from '@home/template-parts/list-item'
/* T_Types */
import type { T_Shortcut_Store } from '@src/common/types'
import type { T_Bookmark } from '@src/common/types/store'
/* CONSTANTS */
import {
    BROWSER,
    CENTRE_PAGES,
    EMOJI,
    IPC_CHANNELS,
    Menu,
    REQUEST_HANDLER,
} from '@src/common/constants'

class Welcome extends A_List<T_Bookmark> {
    private shortcuts: T_Shortcut_Store = {}
    protected folderIndex = 0

    constructor() {
        // 🔖 Bookmark
        super('list--welcome')
        this.bookmarkStore.ready(() => {
            this.bookmarkStore.getAll((bookmarks) => {
                if (!bookmarks || !bookmarks.length) {
                    this.requestBookmarks()
                    return
                }

                this.arrangeBookmarks(bookmarks.reverse())
            })
        })

        new H1(`${EMOJI.FOCUS} Welcome to Focus!`).prependTo('root')

        new Card(
            `${EMOJI.HAND_HEART} Continue (Esc)`,
            'Visit the last page from your history',
        )
            .appendTo('grid')
            .setOnClick(() => {
                navigate()
            })
        new Card(`${EMOJI.SETTINGS} Search Engine`, 'Search Web')
            .appendTo('grid')
            .setOnClick(() => {
                ipcRenderer.send(IPC_CHANNELS.SWITCH, REQUEST_HANDLER.EXECUTE, {
                    searchEngine: true,
                    scene: BROWSER,
                })
            })

        this.requestStatus('userInfo')
        this.requestShortcuts()
    }

    private arrangeBookmarks(bookmarks: T_Bookmark[]) {
        this.dirs = {}
        this.items = []

        bookmarks.forEach((bookmark) => {
            if (bookmark.dir) {
                this.dirs[bookmark.id] = {
                    data: bookmark,
                    hidden: true,
                    dir: [],
                    items: [],
                }
                return
            }
            this.items.push({ data: bookmark, items: [] })
        })

        this.callbackRequestBookmarks()
        this.setEnabled(true)
    }

    /**
     * @deprecated
     */
    private requestBookmarks(): void {
        ipcRenderer.send(IPC_CHANNELS.BOOKMARK, REQUEST_HANDLER.REQUEST)
        ipcRenderer.once(IPC_CHANNELS.BOOKMARK, (_, response) => {
            if (response && Array.isArray(response)) {
                const reverse = [...response].reverse()
                this.bookmarkStore.add(reverse, () =>
                    this.bookmarkStore.getAll((bookmarks) => {
                        this.arrangeBookmarks(bookmarks)
                    }),
                )
            }
        })
    }
    private callbackRequestBookmarks(): void {
        this.list.element.innerHTML = ''

        if (this.items.length || Object.keys(this.dirs).length) {
            new H2(`${EMOJI[Menu.ADD_BOOKMARK]} Your Bookmarks`).prependTo(
                'bookmarks',
            )
        }

        // Dir
        Object.values(this.dirs).forEach((dir) => {
            const icon = new ListItem(EMOJI.FOLDER_CLOSE).setOnClick(() =>
                this.onDirectoryClick(dir.data.id),
            )
            const title = new ListItem(dir.data.title)
                .setOnClick(() => this.onDirectoryClick(dir.data.id))
                .addClass(
                    'list--bookmarks__title',
                    'list--bookmarks__title--dir',
                )

            dir.dir.push(icon, title)
        })

        // Items
        this.items.forEach((item) => {
            const parent =
                item.data.parent && this.dirs[item.data.parent]
                    ? item.data.parent
                    : false

            const title = new ListItem(item.data.title)
                .setOnClick(() => navigate(item.data.url))
                .addClass('list--bookmarks__title')

            if (parent) {
                const icon1 = new ListItem('')
                const icon2 = this.getFaviconColumn(item.data.url).setOnClick(
                    () => navigate(item.data.url),
                )
                item.items.push(icon1, icon2, title)
                this.dirs[parent].items.push(icon1, icon2, title)
            } else {
                const icon = this.getFaviconColumn(item.data.url).setOnClick(
                    () => navigate(item.data.url),
                )
                title.addClass('list--bookmarks__title--dir')
                item.items.push(icon, title)
            }
        })

        // Render
        Object.values(this.dirs).forEach((dir) => {
            dir.dir.forEach((item) => item.appendTo(this.list.element))
            dir.items.forEach((item) => item.appendTo(this.list.element).hide())
        })

        this.items.forEach((bookmark) => {
            bookmark.items.forEach((listItem) => {
                if (bookmark.data.parent) return
                listItem.appendTo(this.list.element)
            })
        })
    }

    private requestShortcuts(): void {
        ipcRenderer.send(IPC_CHANNELS.SHORTCUTS, REQUEST_HANDLER.REQUEST)
        ipcRenderer.on(IPC_CHANNELS.SHORTCUTS, (handler, shortcuts = {}) => {
            switch (handler) {
                case REQUEST_HANDLER.RESPONSE: {
                    this.shortcuts = shortcuts
                    this.callbackRequestShortcut()
                    return
                }
            }
        })
    }
    private callbackRequestShortcut(): void {
        getAddressBar(this.shortcuts[Menu.ADDRESS]).focus()
        const shortcut = this.shortcuts[Menu.CENTRE]
            ? `(${commandSymbol(this.shortcuts[Menu.CENTRE])})`
            : ''
        new Card(
            `${EMOJI.CENTRE} Control Centre ${shortcut}`,
            'Check out what to do',
        )
            .appendTo('grid')
            .setOnClick(() => (window.location.href = CENTRE_PAGES.HOME))
    }

    protected callbackShortcut(e: KeyboardEvent) {
        if (e.key === 'Escape') navigate()
    }

    protected callbackUpdateStatus() {
        // 🤬 Invalid
        if (!this.settings.userInfo) return

        const userInfo = JSON.parse(this.settings.userInfo)
        new UserInfo().picture = userInfo.picture
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Welcome()
})
