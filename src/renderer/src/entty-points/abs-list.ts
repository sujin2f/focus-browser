import { A_Entry } from './abs-entry'
import { Input } from '@src/renderer/src/fragments/input'
import { navigate, tagNameIs } from '@src/renderer/src/utils'

export abstract class A_List<T> extends A_Entry {
    protected search: Input
    protected items: T[] = []
    protected listItems: T[] = []

    constructor() {
        super()

        this.search = new Input('Search', 'search')
            .appendTo('search')
            .setOnInput(() => {
                if (!this.isSearchActivated()) {
                    return
                }

                const keyword = this.search.value.toString().toLowerCase()
                if (!keyword) {
                    this.listItems = this.items
                    this.renderList()
                    return
                }

                this.listItems = this.items.filter((item) =>
                    this.filterList(item, keyword),
                )
                this.renderList()
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
}
