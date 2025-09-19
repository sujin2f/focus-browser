import { type Bookmark, PageMode, PageType, TableAction } from '@src/types'
import IPC from '@home/modules/ipc'

import { A_PageWithTable } from '.'
import Button from '@home/modules/fragments/button'
import Td from '@home/modules/fragments/td'
import Th from '@home/modules/fragments/th'
import Span from '@home/modules/fragments/span'

export default class Anchors extends A_PageWithTable<Bookmark> {
    readonly page = PageType.ANCHOR

    constructor() {
        super()
        this.init()
    }

    request(): void {
        IPC.getInstance().requestAnchors()
    }

    render() {
        this.root.innerHTML = ''

        this.renderButtons()
        this.renderFindForm()
        this.renderTable()
        this.hideForms()

        this.root.appendChild(this.buttons)
        this.root.appendChild(this.formFind.element)
        this.root.appendChild(this.table.element)
    }

    private renderButtons() {
        this.buttons.appendChild(this.buttonFind.element)
    }

    getTHeads(): Th[] {
        const title = new Th()
        title.innerHTML = 'Title'
        title.classList.add('text-left')

        return [title]
    }

    getRowCells(bookmark: Bookmark, index: number): Td[] {
        const title = new Td()

        title.element.addEventListener('click', (e) => {
            const dataset = (e.target as HTMLElement).dataset
            if (dataset['type'] === 'delete') {
                this.cursor = parseInt(dataset['index'])
                this.action(TableAction.DELETE)
                this.cursor = NaN
                return
            }

            IPC.getInstance().navigate(bookmark.url)
        })

        const spanTitle = new Span()
        spanTitle.innerHTML = bookmark.title

        const del = new Button()
        del.classList.remove('mb-3', 'p-2')
        del.classList.add('mr-2', 'cursor-pointer', 'pl-1', 'pr-1')
        del.text = 'Remove'
        del.setData('type', 'delete')
        del.setData('index', index)
        del.addEventListener('click', () => {
            this.cursor = index
            this.action(TableAction.DELETE)
            this.cursor = NaN
        })

        title.child = del
        title.child = spanTitle

        return [title]
    }

    filterCondition(item: Bookmark, keyword: string): boolean {
        return (
            item.title.toLowerCase().includes(keyword.toLowerCase()) ||
            item.url.toLowerCase().includes(keyword.toLowerCase())
        )
    }

    action(action: TableAction, items: Bookmark[] = []) {
        super.action(action, items)

        if (action === TableAction.EXECUTE || action === TableAction.EDIT) {
            IPC.getInstance().navigate(
                this.items[this._cursor].url,
                this._cursor,
            )
            return
        }

        if (action === TableAction.DELETE) {
            if (isNaN(this._cursor)) {
                return
            }

            IPC.getInstance().removeAnchor(this._cursor)
            this.items.splice(this._cursor, 1)
            this.refresh()

            return
        }
    }

    doShortcut(e: KeyboardEvent): boolean {
        if (super.doShortcut(e)) {
            return
        }

        if (e.key.length === 1) {
            this.changeMode(PageMode.FIND)
        }
    }
}
