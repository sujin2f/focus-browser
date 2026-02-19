import { A_Bookmarks } from '@src/renderer/src/entry-points/abstracts/abs-bookmarks'
/* Utils */
import { checkElectron, navigate, tagNameIs } from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { H1 } from '@src/renderer/src/template-parts/h1'
import { Button } from '@src/renderer/src/template-parts/button'
import { BackButton } from '@src/renderer/src/template-parts/back-button'
import { ListItem } from '@src/renderer/src/template-parts/list-item'
import { Input } from '@src/renderer/src/template-parts/input'
import { BookmarkModal } from '@src/renderer/src/template-parts/modules/bookmarks-modal'
/* T_Types */
import type { T_Bookmark } from '@src/common/types'
import { REQUEST_HANDLER } from '@src/common/constants'

class Bookmarks extends A_Bookmarks {
    private modal = new BookmarkModal().appendTo('root')

    constructor() {
        super('bookmark--bookmarks')
        this.requestInfo('title', 'url')

        // Title
        const h1 = new H1('Bookmarks 🔖').prependTo('title')
        new BackButton().prependTo(h1.element)

        // Buttons >> Add Folder
        new Button('📁 Create Folder').appendTo('buttons').setOnClick(() => {
            this.modal.open(this.getDirs(), { isDir: true })
        })
    }

    filterList(item: T_Bookmark, keyword: string): boolean {
        return (
            item.shortcut?.toLowerCase().includes(keyword) ||
            item.title.toLowerCase().includes(keyword)
        )
    }

    renderList() {
        super.renderList()
        this.setShortcuts()
    }

    protected callbackUpdateInfo(): void {
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

    protected callbackResponse(...args: unknown[]) {
        this.modal.hide()

        const handler = args[0] as REQUEST_HANDLER
        if (handler === REQUEST_HANDLER.RESPONSE_SUCCESS) {
            this.modal.notification.info('Bookmark changed.')
        }
        if (handler === REQUEST_HANDLER.RESPONSE_FAIL) {
            this.modal.notification.error('Failed to change Bookmark.')
        }

        super.callbackResponse(...args)
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

        let shortcut = new ListItem('')
        const edit = new ListItem(
            new Button('⚙️', 'button-clear').setOnClick(() => {
                this.modal.open(this.getDirs(), { isDir, bookmark, index })
            }),
        )
        edit.clickable = false

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

        return [icon, row, shortcut, edit]
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

        this.items.forEach(({ data, items }) => {
            const filtered = this.filterList(data, this.searchKeyword)
            items.forEach((item) => {
                if (filtered) {
                    item.show()
                } else {
                    item.hide()
                }
            })
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Bookmarks()
})
