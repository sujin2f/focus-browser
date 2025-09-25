import { type NavigationEntry } from 'electron'
import {
    Channel,
    PageMode,
    PageType,
    RequestHandler,
    TableAction,
} from '@src/types'

import { A_PageWithTable } from '.'
import { Element } from '@home/modules/fragments'
import type { DataListType } from '@home/modules/fragments/data-list'
import { ipcRenderer } from '@home/util'
import Heading from '../fragments/heading'

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

        // H1
        const heading = new Heading(1, {}, 'History')

        this.root.appendChild(heading.element)
        this.root.appendChild(this.buttons.element)
        this.root.appendChild(this.formFind.element)
        this.root.appendChild(this.table.element)
    }

    /**
     * History need reverse order
     */
    protected renderTable() {
        const rows: Element<HTMLTableRowElement>[] = []
        this.table.reset()
        this.items.forEach((item, index) => {
            const tr = new Element<HTMLTableRowElement>('tr', {
                className: [
                    'hover',
                    'cursor-pointer',
                    'text-sm',
                    'antialiased',
                    'font-normal',
                    'leading-normal',
                    'text-blue-gray-900',
                    ...this.STYLE_HOVER,
                ],
            })
            tr.setData('index', index)
            tr.setData('data', item)

            // TODO remove tr from prop
            tr.append(...this.getRowCells(tr, item, index))
            rows.unshift(tr)
        })

        this.table.append(...rows)
    }

    getTHeads(): Element<HTMLTableCellElement>[] {
        return [this.table.createTh({ className: ['text-left'] }, 'Title')]
    }

    getRowCells(
        _: DataListType<Element<HTMLTableRowElement>>,
        history: NavigationEntry,
        index: number,
    ): Element<HTMLTableCellElement>[] {
        return [
            this.table.createTd(
                {
                    onClick: () => {
                        ipcRenderer.send(
                            Channel.HISTORY,
                            RequestHandler.EXECUTE,
                            index,
                        )
                    },
                },
                new Element('span', {}, history.title),
            ),
        ]
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
