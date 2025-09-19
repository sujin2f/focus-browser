import { type NavigationEntry } from 'electron'
import { PageMode, PageType, TableAction } from '@src/types'
import IPC from '@home/modules/ipc'

import { A_PageWithTable } from '.'
import Td from '@home/modules/fragments/td'
import Th from '@home/modules/fragments/th'
import Span from '@home/modules/fragments/span'
import Tr from '@home/modules/fragments/tr'

export default class History extends A_PageWithTable<NavigationEntry> {
    readonly page = PageType.HISTORY

    constructor() {
        super()
        this.init()
    }

    request(): void {
        IPC.getInstance().requestHistory()
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

    /**
     * History need reverse order
     */
    protected renderTable() {
        const rows: Tr[] = []
        this.table.reset()
        this.items.forEach((item, index) => {
            const tr = new Tr()
            tr.setData('index', index)
            tr.classList.add(
                'hover',
                'cursor-pointer',
                'text-sm',
                'antialiased',
                'font-normal',
                'leading-normal',
                'text-blue-gray-900',
                ...this.STYLE_HOVER,
            )

            this.getRowCells(item, index).forEach((td) => (tr.child = td))
            rows.unshift(tr)
        })

        rows.forEach((tr) => {
            this.table.child = tr
        })
    }

    getTHeads(): Th[] {
        const title = new Th()
        title.innerHTML = 'Title'
        title.classList.add('text-left')

        return [title]
    }

    getRowCells(history: NavigationEntry, index: number): Td[] {
        const title = new Td()
        title.element.addEventListener('click', () => {
            IPC.getInstance().navigateHistory(index)
        })

        const spanTitle = new Span()
        spanTitle.innerHTML = history.title
        title.child = spanTitle

        return [title]
    }

    filterCondition(item: NavigationEntry, keyword: string): boolean {
        return (
            item.title.toLowerCase().includes(keyword.toLowerCase()) ||
            item.url.toLowerCase().includes(keyword.toLowerCase())
        )
    }

    action(action: TableAction, items: NavigationEntry[] = []) {
        super.action(action, items)

        if (action === TableAction.EXECUTE || action === TableAction.EDIT) {
            IPC.getInstance().navigate(this.items[this._cursor].url)
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
