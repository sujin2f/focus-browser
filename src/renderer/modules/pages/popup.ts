import { A_PageWithTable } from '@home/modules/pages/abs_with_table'

import { Element } from '@home/modules/fragments'

import type { DataListType } from '@home/modules/fragments/data-list'
import { ipcRenderer } from '@home/util'
import {
    PageMode,
    PageType,
    TableAction,
    Channel,
    RequestHandler,
    type PopupBlocker as T_PopupBlocker,
} from '@src/types'

export class PopupBlocker extends A_PageWithTable<T_PopupBlocker> {
    order: 'ASC' | 'DESC' = 'DESC'
    readonly page = PageType.POPUP_BLOCKER

    constructor() {
        super()
        this.init()
    }

    protected init() {
        super.init()
        this.title.innerHTML = 'Popup Blocker'
    }

    request(): void {
        ipcRenderer.send(Channel.POPUP_BLOCKER, RequestHandler.REQUEST)
        ipcRenderer.once(
            Channel.POPUP_BLOCKER,
            (
                handler: RequestHandler.RESPONSE,
                blocked: string[],
                allowed: string[],
            ) => {
                if (handler !== RequestHandler.RESPONSE) {
                    return
                }

                const data = [
                    ...allowed.map((host) => ({ host, allowed: true })),
                    ...blocked.map((host) => ({ host, allowed: false })),
                ]
                this.action(TableAction.UPDATE, data)
            },
        )
    }

    getTHeads(): Element<HTMLTableCellElement>[] {
        return [
            this.table.createFixedCell('th', {}, 'Allowed'),
            this.table.createTh({ className: ['text-left'] }, 'Title'),
        ]
    }

    getRowCells(
        tr: DataListType<Element<HTMLTableRowElement>>,
        popup: T_PopupBlocker,
        index: number,
    ): Element<HTMLTableCellElement>[] {
        return [
            this.table.createFixedCell(
                'td',
                {
                    onClick: () => {
                        this._cursor = tr
                        this.action(TableAction.EXECUTE)
                        this._cursor = null
                    },
                },
                new Element<HTMLSpanElement>(
                    'span',
                    {},
                    popup.allowed ? '✅' : '',
                ),
            ),
            this.table.createTd(
                {
                    onClick: () => {
                        this._cursor = tr
                        this.action(TableAction.EXECUTE)
                        this._cursor = null
                    },
                },
                new Element<HTMLSpanElement>('span', {}, popup.host),
            ),
        ]
    }

    filterCondition(item: T_PopupBlocker): boolean {
        return item.host
            .toLowerCase()
            .includes(this.searchKeyword.toLowerCase())
    }

    action(action: TableAction, items: T_PopupBlocker[] = []) {
        super.action(action, items)

        if (
            action === TableAction.DELETE ||
            action === TableAction.EXECUTE ||
            action === TableAction.EDIT
        ) {
            const data = this._cursor.getData('data') as T_PopupBlocker
            ipcRenderer.send(
                Channel.POPUP_BLOCKER,
                RequestHandler.MODIFY,
                data.host,
            )
            this.items = this.items.map((item) => {
                if (item.host === data.host) {
                    return {
                        ...item,
                        allowed: !data.allowed,
                    }
                }

                return item
            })
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

    cbInfoUpdated(): void {
        return
    }
}
