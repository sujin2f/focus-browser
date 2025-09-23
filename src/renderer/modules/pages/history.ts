import { type NavigationEntry } from 'electron'
import {
    Channel,
    PageMode,
    PageType,
    RequestHandler,
    TableAction,
} from '@src/types'

import { A_PageWithTable } from '.'
import Td from '@home/modules/fragments/td'
import Th from '@home/modules/fragments/th'
import Span from '@home/modules/fragments/span'
import Tr from '@home/modules/fragments/tr'
import type { DataListType } from '@home/modules/fragments/data-list'
import { ipcRenderer } from '@src/renderer/util'

export default class History extends A_PageWithTable<NavigationEntry> {
    readonly page = PageType.HISTORY

    constructor() {
        super()
        this.init()
    }

    request(): void {
        ipcRenderer.send(Channel.HISTORY, RequestHandler.REQUEST)
        ipcRenderer.once(
            Channel.HISTORY,
            (handler: RequestHandler.RESPONSE, history: NavigationEntry[]) => {
                if (handler !== RequestHandler.RESPONSE) {
                    return
                }

                this.action(TableAction.UPDATE, history)
            },
        )
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

    /**
     * History need reverse order
     */
    protected renderTable() {
        const rows: Tr[] = []
        this.table.reset()
        this.items.forEach((item, index) => {
            const tr = new Tr()
            tr.setData('index', index)
            tr.setData('data', item)
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

            this.getRowCells(tr, item, index).forEach((td) => (tr.child = td))
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

    getRowCells(
        _: DataListType<Tr>,
        history: NavigationEntry,
        index: number,
    ): Td[] {
        const title = new Td()
        title.element.addEventListener('click', () => {
            ipcRenderer.send(Channel.HISTORY, RequestHandler.EXECUTE, index)
        })

        const spanTitle = new Span()
        spanTitle.innerHTML = history.title
        title.child = spanTitle

        return [title]
    }

    filterCondition(item: NavigationEntry): boolean {
        return (
            item.title
                .toLowerCase()
                .includes(this.searchKeyword.toLowerCase()) ||
            item.url.toLowerCase().includes(this.searchKeyword.toLowerCase())
        )
    }

    action(action: TableAction, items: NavigationEntry[] = []) {
        super.action(action, items)

        if (action === TableAction.EXECUTE || action === TableAction.EDIT) {
            const index = this._cursor.getData('index') as number
            ipcRenderer.send(Channel.HISTORY, RequestHandler.EXECUTE, index)
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
