import { A_List } from '@home/entry-points/abstracts/abs-list'
/* <HTML template-part /> */
import { Input } from '@src/renderer/src/template-parts/input'
/* Utils */
import { navigate, tagNameIs } from '@src/renderer/src/utils'

export abstract class A_ListSearch<T> extends A_List<T> {
    protected search: Input

    protected get searchKeyword() {
        return this.search.value.toLowerCase()
    }

    constructor(css: string = '') {
        super(css)
        this.search = new Input('Search', 'search')
            .appendTo('search')
            .setOnInput(() => {
                if (!this.isSearchActivated()) {
                    return
                }
                this.filterSearch()
            })
    }

    protected isSearchActivated() {
        return true
    }

    protected callbackShortcut(e: KeyboardEvent) {
        if (e.key === 'Escape') {
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

    /**
     * Filter an item by keyword
     *
     * @param item
     * @param keyword
     * @returns {boolean} true to show
     */
    protected filterList(_: T, __: string): boolean {
        throw new Error('Not implemented.')
    }

    /**
     * Filter items
     */
    protected filterSearch() {
        if (!this.searchKeyword) {
            this.items.forEach(({ items }) =>
                items.forEach((item) => item.show()),
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
