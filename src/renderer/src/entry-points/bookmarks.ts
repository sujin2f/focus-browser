import { A_Bookmarks } from '@src/renderer/src/entry-points/abstracts/abs-bookmarks'
/* Utils */
import {
    checkElectron,
    getSection,
    ipcRenderer,
    navigate,
    tagNameIs,
} from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { H1 } from '@src/renderer/src/template-parts/h1'
import { Button } from '@src/renderer/src/template-parts/button'
import { BackButton } from '@src/renderer/src/template-parts/back-button'
import { ListItem } from '@src/renderer/src/template-parts/list-item'
import { Input } from '@src/renderer/src/template-parts/input'
import { BookmarkModal } from '@src/renderer/src/template-parts/modules/bookmarks-modal'
import { UserInfo } from '@src/renderer/src/template-parts/user-info'
/* T_Types */
import type { T_Bookmark } from '@src/common/types'
/* CONSTANTS */
import {
    BROWSER,
    CENTRE_PAGES,
    EMOJI,
    IPC_CHANNELS,
    Menu,
    REQUEST_HANDLER,
    SUJINC_URL,
} from '@src/common/constants'

class Bookmarks extends A_Bookmarks {
    private modal = new BookmarkModal().appendTo('root')

    constructor() {
        super('bookmark--bookmarks')
        this.requestStatus('title', 'url', 'userInfo')

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
            case REQUEST_HANDLER.PUT:
                this.modal.notification.info(bookmarks[0].title)
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

        let shortcut = new ListItem('')
        if (bookmark.shortcut) {
            // Shortcut
            shortcut = new ListItem(
                new Button(bookmark.shortcut.toUpperCase()).setOnClick(() => {
                    if (isDir) {
                        return
                    }
                    navigate({ address: bookmark.url })
                }),
            )
        }

        let send = new ListItem('')
        if (bookmark.url) {
            // Shortcut
            send = new ListItem(
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
                        [bookmark],
                    )
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

    /**
     * shortcuts
     */
    private shortcuts: Record<string, string> = {}
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

    /**
     * from A_ListSearch
     */
    /**
     * Filter by keyword
     *
     * @param item
     * @param keyword
     * @returns {boolean} true to show
     */
    filterList(item: T_Bookmark, keyword: string): boolean {
        return (
            item.shortcut?.toLowerCase().includes(keyword) ||
            item.title.toLowerCase().includes(keyword)
        )
    }
    private search: Input = new Input('Search', 'search')
        .appendTo('search')
        .setOnInput(() => {
            if (!this.isSearchActivated()) {
                return
            }
            this.filterSearch()
        })
        .setOnKeyUp((e) => {
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
    private matchShortcut = ''
    protected get searchKeyword() {
        return this.search.value.toLowerCase()
    }
    protected isSearchActivated() {
        if (this.modal.activated) {
            return false
        }
        return true
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
    protected filterSearch() {
        if (!this.searchKeyword) {
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
