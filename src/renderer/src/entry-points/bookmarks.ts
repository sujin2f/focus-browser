import { A_Bookmarks } from '@home/entry-points/abstracts/abs-bookmarks'
import { A_TraitCloudPush } from '@home/entry-points/abstracts/abs-list-cloud-push'
import { A_TraitSearch } from '@home/entry-points/abstracts/abs-list-search'
/* Models */
import { Logger } from '@src/renderer/logger'
/* Utils */
import { checkElectron, ipcRenderer, navigate, tagNameIs } from '@home/utils'
/* <HTML template-part /> */
import { H1 } from '@home/template-parts/h1'
import { Button } from '@home/template-parts/button'
import { BackButton } from '@home/template-parts/back-button'
import { ListItem } from '@home/template-parts/list-item'
import { BookmarkModal } from '@home/template-parts/modules/bookmarks-modal'
import { UserInfo } from '@home/template-parts/user-info'
/* T_Types */
import type { T_Bookmark } from '@src/common/types'
/* CONSTANTS */
import {
    CENTRE_PAGES,
    EMOJI,
    IPC_CHANNELS,
    Menu,
    REQUEST_HANDLER,
} from '@src/common/constants'

class Search extends A_TraitSearch<T_Bookmark> {
    public modal?: BookmarkModal

    constructor(
        protected parent: Bookmarks,
        private callbackFilterSearch: (keyword: string) => void,
    ) {
        super(parent)
    }

    protected isSearchActivated() {
        if (this.modal?.activated) {
            return false
        }
        return true
    }

    filterList(item: T_Bookmark, keyword: string): boolean {
        return (
            item.shortcut?.toLowerCase().includes(keyword) ||
            item.title.toLowerCase().includes(keyword)
        )
    }

    filterSearch() {
        this.callbackFilterSearch(this.searchKeyword)
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

class Bookmarks extends A_Bookmarks {
    public modal = new BookmarkModal().appendTo('root')
    // shortcuts
    private shortcuts: Record<string, string> = {}
    private matchShortcut = ''
    // Search
    private search = new Search(this, this.filterSearch.bind(this))
    // Push
    private cloud = new CloudPush(this, this.modal.notification)

    constructor() {
        super('list--bookmarks')
        this.requestStatus('title', 'url', 'userInfo')

        this.search.modal = this.modal
        this.search.element.setOnKeyUp((e) => {
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
        const h1 = new H1(`Bookmarks ${EMOJI[Menu.ADD_BOOKMARK]}`).prependTo(
            'title',
        )
        new BackButton().prependTo(h1.element)

        // Buttons >> Create Folder
        new Button(`${EMOJI.FOLDER_OPEN} Create Folder`)
            .appendTo('buttons')
            .setOnClick(() => {
                this.modal.open(this.getDirs(), { isDir: true })
            })
    }

    renderList() {
        super.renderList()
        this.setShortcuts()
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

        if (this.settings.url) {
            // Buttons >> Add Bookmark
            new Button('💾 Add Bookmark')
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
    }

    protected callbackResponse(
        handler: REQUEST_HANDLER,
        bookmarks: T_Bookmark[],
    ) {
        this.modal.hide()
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
        const isDir = !bookmark.url

        const icon = new ListItem(
            isDir
                ? '📁'
                : bookmark.parent && this.dirs[bookmark.parent]
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
            send = new ListItem(
                new Button(EMOJI.GLOBE, 'button-clear').setOnClick(() => {
                    this.cloud.sendCloudPush(bookmark)
                }),
            )
        }
        send.clickable = false

        return [icon, row, shortcut, send, edit]
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
        this.search.element.value = ''
        this.matchShortcut = ''
        this.search.element.focus()
    }

    filterSearch(searchKeyword: string) {
        if (!searchKeyword) {
            this.items.forEach(({ data, items }) =>
                items.forEach((item) => {
                    if (data.parent) {
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
            const show = this.search.filterList(data, searchKeyword)
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
            const show = this.search.filterList(
                this.dirs[id].data,
                searchKeyword,
            )
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
