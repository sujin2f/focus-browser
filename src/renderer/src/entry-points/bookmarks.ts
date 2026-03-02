import { A_ListCloudPush } from '@home/entry-points/abstracts/abs-list-cloud-push'
/* Utils */
import {
    checkElectron,
    ipcRenderer,
    navigate,
    tagNameIs,
} from '@src/renderer/src/utils'
import { callbackRequestBookmarks } from '@home/utils/bookmark'
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
import { Bookmark } from '@home/utils/indexedDB/bookmark'

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

    private store: Bookmark

    constructor() {
        super('list--bookmarks')
        this.store = new Bookmark()
        this.initStore()
        // 🎹 shortcuts
        this.initSearch()

        // Title
        new Title(`Bookmarks ${EMOJI[Menu.ADD_BOOKMARK]}`)

        // 📂 Buttons >> Create Folder
        this.createFolder = new Button(`${EMOJI.FOLDER_OPEN} Create Folder`)
            .appendTo('buttons')
            .setOnClick(() => {
                this.modal.open(this.getDirs(), { isDir: true })
            })
        // 🔖 Buttons >> Add Bookmark
        this.createItem = new Button('💾 Add Bookmark')
            .prependTo('buttons')
            .setOnClick(() => {
                this.modal.open(this.getDirs(), {
                    bookmark: {
                        id: '',
                        title: this.settings.title || '',
                        url: this.settings.url || '',
                    } satisfies T_Bookmark,
                })
            })

        this.requestStatus('title', 'url', 'userInfo')
    }

    private initStore() {
        this.store.ready(() => {
            this.store.getAll('bookmark', (bookmarks) => {
                if (!bookmarks || !bookmarks.length) {
                    this.requestBookmarks()
                    return
                }

                this.dirs = {}
                this.items = []

                bookmarks.reverse().forEach((bookmark) => {
                    if (bookmark.dir) {
                        this.dirs[bookmark.id] = {
                            data: bookmark,
                            hidden: true,
                            dir: [],
                            items: [],
                        }
                    } else {
                        this.items.push({ data: bookmark, items: [] })
                    }
                })
                console.log(this.items)
                this.setShortcuts()
                this.callbackRequestBookmarks()
                this.setEnabled(true)
            })
        })
    }

    private initSearch() {
        this.search.setOnKeyUp((e) => {
            // Allow standard location only
            if (e.location !== e.DOM_KEY_LOCATION_STANDARD) {
                return
            }

            // For non-English keyboard, extract English key stroke from KeyboardEvent
            if (e.code.startsWith('Key')) {
                this.matchShortcut += e.code.charAt(3)
            } else if (e.key.length === 1) {
                this.matchShortcut += e.key
            }

            const shortcut = this.shortcuts[this.matchShortcut.toLowerCase()]
            if (shortcut) {
                navigate(shortcut)
                return true
            }
        })
    }

    /**
     * @deprecated
     */
    private requestBookmarks(): void {
        ipcRenderer.send(IPC_CHANNELS.BOOKMARK, REQUEST_HANDLER.REQUEST)
        ipcRenderer.once(IPC_CHANNELS.BOOKMARKS_RESPONSE, (_, response) => {
            if (response) {
                Object.keys(response.dirs).forEach((dir) => {
                    this.store.add({
                        ...response.dirs[dir],
                        dir: true,
                        type: 'bookmark',
                    })
                })
                const reverse = Object.keys(response.items)
                    .map((id) => response.items[id])
                    .reverse()
                reverse.forEach((item) => {
                    this.store.add({
                        ...item,
                        dir: false,
                        type: 'bookmark',
                    })
                })
                const { dirs, items } = callbackRequestBookmarks(response)
                this.dirs = dirs
                this.items = items
                this.setShortcuts()
                this.callbackRequestBookmarks()
                this.setEnabled(true)
            }
        })
    }
    private callbackRequestBookmarks(): void {
        this.list.element.innerHTML = ''

        // Dir
        Object.values(this.dirs).forEach((dir) => {
            const icon = new ListItem(EMOJI.FOLDER_CLOSE).setOnClick(() => {
                this.onDirectoryClick(dir.data.id)
            })
            const title = new ListItem(dir.data.title)
                .setOnClick(() => {
                    this.onDirectoryClick(dir.data.id)
                })
                .addClass(
                    'list--bookmarks__title',
                    'list--bookmarks__title--dir',
                )
            let shortcut = new ListItem('')
            if (dir.data.shortcut) {
                shortcut = new ListItem(
                    new Button(dir.data.shortcut.toUpperCase()).setOnClick(() =>
                        this.onDirectoryClick(dir.data.id),
                    ),
                )
            }
            const edit = new ListItem(
                new Button(EMOJI.SETTINGS, 'button-clear').setOnClick(() => {
                    this.modal.open(this.getDirs(), {
                        isDir: true,
                        bookmark: dir.data,
                    })
                }),
            )
            edit.clickable = false

            dir.dir.push(icon, title, shortcut, new ListItem(''), edit)
        })

        // Items
        this.items.forEach((item) => {
            const parent =
                item.data.parent && this.dirs[item.data.parent]
                    ? item.data.parent
                    : false
            const columns: ListItem[] = []

            const title = new ListItem(item.data.title)
                .setOnClick(() => {
                    navigate(item.data.url)
                })
                .addClass('list--bookmarks__title')

            if (!parent) {
                const icon = this.getFaviconColumn(item.data.url).setOnClick(
                    () => {
                        navigate(item.data.url)
                    },
                )
                title.addClass('list--bookmarks__title--dir')
                columns.push(icon, title)
            } else {
                const icon1 = new ListItem('').setOnClick(() => {
                    navigate(item.data.url)
                })
                const icon2 = this.getFaviconColumn(item.data.url).setOnClick(
                    () => {
                        navigate(item.data.url)
                    },
                )
                columns.push(icon1, icon2, title)
            }

            let shortcut = new ListItem('')
            if (item.data.shortcut) {
                shortcut = new ListItem(
                    new Button(item.data.shortcut.toUpperCase()).setOnClick(
                        () => navigate(item.data.url),
                    ),
                )
            }
            // ☁️ Cloud
            let cloud = new ListItem('')
            if (item.data.url) {
                const button = this.createCloudPushButton({
                    title: item.data.title,
                    key: item.data.url,
                    type: 'bookmark',
                    message: JSON.stringify(item.data),
                })
                cloud = new ListItem(button)
            }
            cloud.clickable = false
            const edit = new ListItem(
                new Button(EMOJI.SETTINGS, 'button-clear').setOnClick(() => {
                    this.modal.open(this.getDirs(), {
                        isDir: false,
                        bookmark: item.data,
                    })
                }),
            )
            edit.clickable = false

            item.items.push(...columns, shortcut, cloud, edit)
            if (parent) {
                this.dirs[parent].items.push(...columns, shortcut, cloud, edit)
            }
        })

        // Render
        Object.values(this.dirs).forEach((dir) => {
            dir.dir.forEach((item) => item.appendTo(this.list.element))
            dir.items.forEach((item) => item.appendTo(this.list.element).hide())
        })

        this.items.forEach((bookmark) => {
            bookmark.items.forEach((listItem) => {
                if (bookmark.data.parent) {
                    return
                }
                listItem.appendTo(this.list.element)
            })
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
