import { A_ListCloudPush } from '@home/entry-points/abstracts/abs-list-cloud-push'
/* Utils */
import {
    checkElectron,
    ipcRenderer,
    navigate,
    tagNameIs,
} from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { Title } from '@home/template-parts/modules/title'
import { Button } from '@home/template-parts/button'
import { ListItem } from '@home/template-parts/list-item'
import { BookmarkModal } from '@home/template-parts/modules/bookmarks-modal'
import { UserInfo } from '@home/template-parts/user-info'
import { Notification } from '@home/template-parts/notification'
/* T_Types */
import type { T_Bookmark } from '@src/common/types/store'
/* CONSTANTS */
import {
    CENTRE_PAGES,
    EMOJI,
    IPC_CHANNELS,
    Menu,
    REQUEST_HANDLER,
} from '@src/common/constants'
/* Models */
import { Logger } from '@src/common/logger'

class Bookmarks extends A_ListCloudPush<T_Bookmark> {
    protected folderIndex = 0

    public modal = new BookmarkModal().appendTo('root')
    protected notification: Notification = this.modal.notification
    // 🎹 shortcuts
    private shortcuts: Record<string, string> = {}
    private matchShortcut = ''
    // Buttons
    private createFolder: Button
    private createItem: Button
    // (En/Dis)able
    public setEnabled(enabled: boolean) {
        super.setEnabled(enabled)
        if (enabled) {
            this.createFolder.enable()
            this.createItem.enable()
        } else {
            this.createFolder.disable()
            this.createItem.disable()
        }
    }

    constructor() {
        super('list--bookmarks')
        this.requestStatus('title', 'url', 'userInfo')
        this.initStore()
        // 🎹 shortcuts
        this.initSearch()
        this.ipcListener()

        // Title
        new Title(`Bookmarks ${EMOJI[Menu.ADD_BOOKMARK]}`)

        // 📂 Buttons >> Create Folder
        this.createFolder = new Button(`${EMOJI.FOLDER_OPEN} Create Folder`)
            .appendTo('buttons')
            .on('click', () => {
                this.modal.open(this.getDirs(), {
                    dir: true,
                    url: '',
                    title: '',
                } as T_Bookmark)
            })
        // 🔖 Buttons >> Add Bookmark
        this.createItem = new Button('💾 Add Bookmark')
            .prependTo('buttons')
            .on('click', () => {
                this.modal.open(this.getDirs(), {
                    dir: false,
                    url: this.settings.url || '',
                    title: this.settings.title || '',
                } as T_Bookmark)
            })
    }

    private initStore() {
        this.bookmarkStore.ready(() => {
            this.bookmarkStore.getAll((bookmarks) => {
                if (!bookmarks || !bookmarks.length) {
                    this.requestBookmarks()
                    return
                }

                this.arrangeBookmarks(bookmarks.reverse())
            })
        })
    }

    private initSearch() {
        this.search.setOnKeyUp((e) => {
            // 🤬 Allow standard location only
            if (e.location !== e.DOM_KEY_LOCATION_STANDARD) return

            // For non-English keyboard, extract English key stroke from KeyboardEvent
            if (e.code.startsWith('Key')) {
                this.matchShortcut += e.code.charAt(3)
            } else if (e.key.length === 1) {
                this.matchShortcut += e.key
            }

            const shortcut = this.shortcuts[this.matchShortcut.toLowerCase()]
            if (shortcut) navigate(shortcut)
        })
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

        this.setShortcuts()
        this.render()
        this.setEnabled(true)
    }

    /**
     * @deprecated
     */
    private requestBookmarks(): void {
        ipcRenderer.send(IPC_CHANNELS.BOOKMARK, REQUEST_HANDLER.REQUEST)
        ipcRenderer.once(IPC_CHANNELS.BOOKMARK, (handler, response) => {
            if (handler !== REQUEST_HANDLER.RESPONSE_SUCCESS) return
            if (!response || !Array.isArray(response)) return

            const reverse = [...response].reverse()
            this.bookmarkStore.add(reverse, () =>
                this.bookmarkStore.getAll((bookmarks) =>
                    this.arrangeBookmarks(bookmarks),
                ),
            )
        })
    }

    private ipcListener(): void {
        ipcRenderer.on(IPC_CHANNELS.BOOKMARK, (handler, id) => {
            switch (handler) {
                case REQUEST_HANDLER.MODIFY: {
                    if (typeof id !== 'string') return
                    const item = Object.keys(this.dirs).includes(id)
                        ? this.dirs[id].data
                        : this.items
                              .filter((item) => item.data.id === id)
                              .map((item) => item.data)[0]
                    Logger.init().info(
                        'Bookmarks::ipcListener():: MODIFY',
                        id,
                        item,
                    )
                    if (item) this.modal.open(this.getDirs(), item)
                    return
                }
                case REQUEST_HANDLER.REMOVE: {
                    if (typeof id !== 'number') return
                    this.bookmarkStore.remove(id, () =>
                        window.location.reload(),
                    )
                    return
                }
            }
        })
    }

    private render(): void {
        this.list.element.innerHTML = ''

        // Dir
        Object.values(this.dirs).forEach((dir) => {
            const icon = new ListItem(EMOJI.FOLDER_CLOSE).on('click', () =>
                this.onDirectoryClick(dir.data.id),
            )
            const title = new ListItem(dir.data.title)
                .on('click', () => this.onDirectoryClick(dir.data.id))
                .addClass('list__item--colspan-2-2')
            const shortcut = new ListItem('').on('click', () =>
                this.onDirectoryClick(dir.data.id),
            )
            if (dir.data.shortcut) {
                shortcut.title = new Button(
                    dir.data.shortcut.toUpperCase(),
                    'button-small',
                )
            }
            const edit = new ListItem(EMOJI.MENU)
                .on('click', (e) => this.showContextMenu(e, dir.data))
                .on('contextmenu', (e) => this.showContextMenu(e, dir.data))

            dir.dir.push(icon, title, shortcut, edit)
        })

        // Items
        this.items.forEach((item) => {
            const parent = this.hasParent(item.data)
            const columns: ListItem[] = []

            const title = new ListItem(item.data.title).on('click', () =>
                navigate(item.data.url),
            )

            if (!parent) {
                const favicon = this.getFaviconColumn(item.data.url).on(
                    'click',
                    () => navigate(item.data.url),
                )
                title.addClass('list__item--colspan-2-2')
                columns.push(favicon, title)
            } else {
                const empty = new ListItem('').on('click', () =>
                    navigate(item.data.url),
                )
                const favicon = this.getFaviconColumn(item.data.url).on(
                    'click',
                    () => navigate(item.data.url),
                )
                columns.push(empty, favicon, title)
            }

            const shortcut = new ListItem('').on('click', () =>
                navigate(item.data.url),
            )
            if (item.data.shortcut) {
                shortcut.title = new Button(
                    item.data.shortcut.toUpperCase(),
                    'button-small',
                )
            }

            const edit = new ListItem(EMOJI.MENU)
                .on('click', (e) => this.showContextMenu(e, item.data))
                .on('contextmenu', (e) => this.showContextMenu(e, item.data))

            item.items.push(...columns, shortcut, edit)
            if (parent) {
                this.dirs[parent].items.push(...columns, shortcut, edit)
            }
        })

        // Render
        Object.values(this.dirs).forEach((dir) => {
            dir.dir.forEach((item) => item.appendTo(this.list.element))
            dir.items.forEach((item) => item.appendTo(this.list.element).hide())
        })

        this.items.forEach((bookmark) => {
            bookmark.items.forEach((listItem) => {
                if (this.hasParent(bookmark.data)) {
                    return
                }
                listItem.appendTo(this.list.element)
            })
        })
    }

    private hasParent(item: T_Bookmark) {
        return item.parent && this.dirs[item.parent] ? item.parent : false
    }

    private showContextMenu(e: PointerEvent, item: T_Bookmark) {
        e.preventDefault()

        const enabled: string[] = ['remove', 'edit']
        if (!item.dir && !this.hasCloudItem.has(item.url)) enabled.push('cloud')
        this.currentUrl = item.url

        ipcRenderer.send(IPC_CHANNELS.CONTEXT, REQUEST_HANDLER.EXECUTE, {
            x: e.x,
            y: e.y,
            type: 'bookmark',
            item,
            enabled,
        })
    }

    /**
     * 🎹 Key input callback
     * @param e
     * @returns
     */
    protected callbackShortcut(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            if (this.modal.activated) {
                this.modal.hide()
                return
            }

            if (tagNameIs(document.activeElement, 'input')) {
                ;(document.activeElement as HTMLInputElement).blur()
                return
            }
            navigate()
            return
        }

        if (tagNameIs(document.activeElement, 'input')) {
            return
        }

        if (e.key.length !== 1) {
            return
        }

        if (e.altKey || e.ctrlKey || e.metaKey) {
            return
        }

        // Focus Search
        this.search.value = ''
        this.matchShortcut = ''
        this.search.focus()
    }

    protected callbackUpdateStatus(): void {
        const userInfo = new UserInfo()
        if (this.settings.userInfo) {
            // 👤 Profile
            const user = JSON.parse(this.settings.userInfo)
            userInfo.picture = user.picture

            // ☁️ Buttons >> Import Bookmarks
            new Button(`${EMOJI.GLOBE} Import Bookmarks`)
                .appendTo('buttons')
                .setOnClick(() => {
                    window.location.href = CENTRE_PAGES.IMPORTER
                })
        } else {
            userInfo.loggedOut()
        }
    }

    private getDirs(): T_Bookmark[] {
        return Object.values(this.dirs).map((item) => item.data)
    }

    private setShortcuts() {
        this.items.forEach((item) => {
            if (item.data.url && item.data.shortcut) {
                const shortcut = item.data.shortcut.toLowerCase()
                const parent = item.data.parent

                if (parent && this.dirs[parent]) {
                    const dirShortcut =
                        this.dirs[parent].data.shortcut?.toLowerCase()
                    this.shortcuts[`${dirShortcut}${shortcut}`] = item.data.url
                } else {
                    this.shortcuts[shortcut] = item.data.url
                }
            }
        })
    }

    protected filterList(item: T_Bookmark, keyword: string): boolean {
        return (
            item.shortcut?.toLowerCase().includes(keyword) ||
            item.title.toLowerCase().includes(keyword)
        )
    }

    protected isSearchActivated() {
        if (this.modal?.activated) {
            return false
        }
        return true
    }

    protected filterSearch() {
        if (!this.searchKeyword) {
            this.items.forEach(({ data, items }) =>
                items.forEach((item) => {
                    if (data.parent && data.url) {
                        item.hide()
                    } else {
                        item.show()
                    }
                }),
            )
            return
        }

        // Item Has search keyword
        this.items.forEach(({ data, items }) => {
            const show = this.filterList(data, this.searchKeyword)
            items.forEach((item) => {
                if (show) {
                    item.show()
                } else {
                    item.hide()
                }
            })
        })

        // Show items from matched Directory
        Object.keys(this.dirs).forEach((id) => {
            const show = this.filterList(this.dirs[id].data, this.searchKeyword)
            if (!show) {
                return
            }

            this.dirs[id].items.forEach((item) => {
                item.show()
            })
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Bookmarks()
})
