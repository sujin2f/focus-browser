import { A_PageWithTable } from '@home/modules/pages/abs_with_table'

import { Element } from '@home/modules/fragments'
import { Callout } from '@home/modules/fragments/callout'
import { TrLinked } from '@home/modules/fragments/tr-linked'
import { ShortcodeTable } from '@home/modules/fragments/table-shortcode'

import { ipcRenderer } from '@home/utils'
import type { PopupBlocker as T_PopupBlocker } from '@src/common/types'
import {
    TableAction,
    Channel,
    RequestHandler,
    PageType,
    CTRL,
} from '@src/common/constants'

export class PopupBlocker extends A_PageWithTable<T_PopupBlocker> {
    order: 'ASC' | 'DESC' = 'DESC'
    readonly page = PageType.POPUP_BLOCKER

    constructor() {
        super()
        this.init()
    }

    protected init() {
        super.init()
        this.title.label = 'Popup Blocker'
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
                    ...blocked.map((host) => ({ host, allowed: false })),
                    ...allowed.map((host) => ({ host, allowed: true })),
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
        tr: TrLinked<{ index: number; data: T_PopupBlocker }>,
    ): Element<HTMLTableCellElement>[] {
        const popup = tr.getData('data') as T_PopupBlocker
        return [
            this.table.createFixedCell(
                'td',
                {
                    onClick: () => {
                        this._cursor = tr
                        this.action(TableAction.EXECUTE)
                    },
                },
                new Element<HTMLSpanElement>({ tag: 'span' }).append(
                    popup.allowed ? '✅' : '',
                ),
            ),
            this.table.createTd(
                {
                    onClick: () => {
                        this._cursor = tr
                        this.action(TableAction.EXECUTE)
                    },
                },
                new Element<HTMLSpanElement>({ tag: 'span' }).append(
                    popup.host,
                ),
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
            const index = this._cursor.getData('index') as number
            ipcRenderer.send(
                Channel.POPUP_BLOCKER,
                RequestHandler.MODIFY,
                data.host,
            )

            this.items[index].allowed = !this.items[index].allowed
            this._cursor = null
            this.refresh()
            return
        }
    }

    refresh(): void {
        if (!window.controller.setting.helpText) {
            this.helpText.destroy()
            this.helpText = new Element({ tag: 'section' })
            return
        }

        const callout = new Callout({
            className: ['mb-4', 'max-w-2xl'],
        }).append(
            new ShortcodeTable({
                [`${CTRL}+F`]: 'Find from Popup Blocker',
                ['⬇︎']: 'Select Popup Blocker',
                Enter: 'Toggle Popup Blocker allowance',
            }),
            new Element({
                tag: 'p',
                className: ['dark:text-gray-300', 'mb-2'],
            }).append('Press any key to find Popup Blocker.'),
        )
        this.helpText.append(callout)
    }
}
