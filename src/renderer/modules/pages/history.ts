import { type NavigationEntry } from 'electron'
import { A_PageWithTable } from '@home/modules/pages/abs_with_table'

import { Element } from '@home/modules/fragments'

import type { DataListType } from '@home/modules/fragments/data-list'
import { ipcRenderer } from '@home/util'
import {
    Channel,
    PageMode,
    PageType,
    RequestHandler,
    TableAction,
} from '@src/types'

export class History extends A_PageWithTable<NavigationEntry> {
    order: 'ASC' | 'DESC' = 'DESC'
    readonly page = PageType.HISTORY

    constructor() {
        super()
        this.init()
    }

    protected init() {
        super.init()
        this.title.innerHTML = 'History'
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

    cbInfoUpdated(): void {
        return
    }
}
