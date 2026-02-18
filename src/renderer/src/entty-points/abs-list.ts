import { A_Entry } from './abs-entry'
import { Input } from '@src/renderer/src/template-parts/input'
import { navigate, tagNameIs } from '@src/renderer/src/utils'

export abstract class A_List<T> extends A_Entry {
    private search: Input
    protected items: T[] = []
    protected listItems: T[] = []

    protected get searchKeyword() {
        return this.search.value.toString().toLowerCase()
    }

    constructor() {
        super()

        this.search = new Input('Search', 'search')
            .appendTo('search')
            .setOnInput(() => {
                if (!this.isSearchActivated()) {
                    return
                }

                this.filterSearch()
            })
    }

    abstract filterList(item: T, keyword: string): boolean
    abstract renderList(): void

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

    protected filterSearch() {
        if (!this.searchKeyword) {
            this.listItems = this.items
            this.renderList()
            return
        }

        this.listItems = this.items.filter((item) =>
            this.filterList(item, this.searchKeyword),
        )
        this.renderList()
    }
}
