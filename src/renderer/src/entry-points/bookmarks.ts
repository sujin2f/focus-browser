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
        if (this.modal.activated) {
            this.modal.hide()
            this.modal.notification.info('Bookmark changed.')
        }
        super.renderList()
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
                navigate(bookmark.url)
            },
        )

        const shortcut = new ListItem('')
        const edit = new ListItem('')
        edit.clickable = false

        new Button('⚙️', 'button-clear').appendTo(edit.title).setOnClick(() => {
            this.modal.open(this.getDirs(), { isDir, bookmark, index })
        })

        if (bookmark.shortcut) {
            // Shortcut
            new Button(bookmark.shortcut.toUpperCase())
                .prependTo(shortcut.title)
                .setOnClick(() => {
                    if (isDir) {
                        return
                    }
                    navigate(bookmark.url)
                })
        }

        return [icon, row, shortcut, edit]
    }

    private getDirs() {
        return this.items
            .filter(({ data }) => !data.url)
            .map(({ data }) => data)
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
    protected get searchKeyword() {
        return this.search.value.toLowerCase()
    }
    protected isSearchActivated() {
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
