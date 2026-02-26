import { A_TraitBookmarks } from './abstracts/abs-bookmarks'
import { A_ListCloudPush } from '@home/entry-points/abstracts/abs-list-cloud-push'
/* Utils */
import { checkElectron, navigate, tagNameIs } from '@home/utils'
/* <HTML template-part /> */
import { Title } from '@home/template-parts/modules/title'
import { Button } from '@home/template-parts/button'
import { ListItem } from '@home/template-parts/list-item'
import { BookmarkModal } from '@home/template-parts/modules/bookmarks-modal'
import { UserInfo } from '@home/template-parts/user-info'
import { ButtonCloudPush } from '@home/template-parts/modules/button-cloud-push'
import { Notification } from '@home/template-parts/notification'
/* T_Types */
import type { T_Bookmark } from '@src/common/types'
/* CONSTANTS */
import {
    CENTRE_PAGES,
    EMOJI,
    Menu,
    REQUEST_HANDLER,
} from '@src/common/constants'
/* Models */
import { Logger } from '@src/renderer/logger'

class TraitBookmarks extends A_TraitBookmarks {
    constructor(
        protected parent: Bookmarks,
        private modal: BookmarkModal,
    ) {
        super(parent)
    }

    protected callbackResponse(
        handler: REQUEST_HANDLER,
        bookmarks: T_Bookmark[],
    ) {
        this.modal.hide()
        this.parent.setEnabled(true)
        switch (handler) {
            case REQUEST_HANDLER.RESPONSE:
                super.callbackResponse(handler, bookmarks)
                return
            case REQUEST_HANDLER.RESPONSE_SUCCESS:
                this.modal.notification.info(
                    'Your request is successfully executed.',
                )
                super.callbackResponse(handler, bookmarks)
                return
            case REQUEST_HANDLER.RESPONSE_FAIL:
                this.modal.notification.error(bookmarks[0].title)
                return
        }
    }

    protected getListCols(bookmark: T_Bookmark, index: number) {
        return this.parent.getListCols(bookmark, index)
    }
}

class Bookmarks extends A_ListCloudPush<T_Bookmark> {
    public modal = new BookmarkModal().appendTo('root')
    protected notification: Notification = this.modal.notification
    // shortcuts
    private shortcuts: Record<string, string> = {}
    private matchShortcut = ''
    // Bookmark Trait
    private bookmarks = new TraitBookmarks(this, this.modal)
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
                navigate({ address: shortcut })
                return true
            }
        })

        // Title
        new Title(`Bookmarks ${EMOJI[Menu.ADD_BOOKMARK]}`)

        // Buttons >> Create Folder
        this.createFolder = new Button(`${EMOJI.FOLDER_OPEN} Create Folder`)
            .appendTo('buttons')
            .setOnClick(() => {
                this.modal.open(this.getDirs(), { isDir: true })
            })
        // Buttons >> Add Bookmark
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
    }

    renderList() {
        super.renderList()
        this.bookmarks.renderList()
        this.setShortcuts()
    }

    getListCols(bookmark: T_Bookmark, index: number) {
        const isDir = !bookmark.url

        const icon = new ListItem(
            isDir
                ? '📁'
                : bookmark.parent && this.bookmarks.dirs[bookmark.parent]
                  ? '⋯'
                  : '',
        )
        const row = new ListItem(bookmark.title, bookmark.url).setOnClick(
            (e: PointerEvent) => {
                if (isDir || tagNameIs(e.target, 'button')) {
                    return
                }
                navigate({ address: bookmark.url })
            },
        )

        const edit = new ListItem(
            new Button(EMOJI.SETTINGS, 'button-clear').setOnClick(() => {
                this.modal.open(this.getDirs(), { isDir, bookmark, index })
            }),
        )
        edit.clickable = false

        // Shortcut
        let shortcut = new ListItem('')
        if (bookmark.shortcut) {
            shortcut = new ListItem(
                new Button(bookmark.shortcut.toUpperCase()).setOnClick(() => {
                    if (isDir) {
                        return
                    }
                    navigate({ address: bookmark.url })
                }),
            )
        }

        // Cloud
        let send = new ListItem('')
        if (bookmark.url) {
            const button = new ButtonCloudPush(
                {
                    title: bookmark.title,
                    key: bookmark.url,
                    type: 'bookmark',
                    message: JSON.stringify(bookmark),
                },
                () => this.settings.userInfo,
                (button: ButtonCloudPush) => {
                    Logger.getInstance().log(
                        `Cloud push button clicked.`,
                        this.enabled,
                        this.callbackCloudPush.toString(),
                    )
                    const enabled = this.enabled
                    if (enabled) {
                        this.callbackCloudPush(button)
                    }
                    return enabled
                },
            )
            send = new ListItem(button)
        }
        send.clickable = false

        return [icon, row, shortcut, send, edit]
    }

    protected callbackUpdateStatus(): void {
        const userInfo = new UserInfo()
        if (this.settings.userInfo) {
            const user = JSON.parse(this.settings.userInfo)
            userInfo.picture = user.picture

            // Buttons >> Import Bookmarks
            new Button(`${EMOJI.GLOBE} Import Bookmarks`)
                .appendTo('buttons')
                .setOnClick(() => {
                    window.location.href = CENTRE_PAGES.IMPORTER
                })
        } else {
            userInfo.loggedOut()
        }
    }

    private getDirs() {
        return this.items
            .filter(({ data }) => !data.url)
            .map(({ data }) => data)
    }

    private setShortcuts() {
        this.items.forEach((item) => {
            if (item.data.url && item.data.shortcut) {
                const shortcut = item.data.shortcut.toLowerCase()
                const parent = item.data.parent

                if (parent && this.bookmarks.dirs[parent]) {
                    const dirShortcut =
                        this.bookmarks.dirs[parent].data.shortcut?.toLowerCase()
                    this.shortcuts[`${dirShortcut}${shortcut}`] = item.data.url
                } else {
                    this.shortcuts[shortcut] = item.data.url
                }
            }
        })
    }

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
            navigate({})
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

    filterList(item: T_Bookmark, keyword: string): boolean {
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
        Object.keys(this.bookmarks.dirs).forEach((id) => {
            const show = this.filterList(
                this.bookmarks.dirs[id].data,
                this.searchKeyword,
            )
            if (!show) {
                return
            }

            this.bookmarks.dirs[id].items.forEach((item) => {
                item.show()
            })
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Bookmarks()
})
