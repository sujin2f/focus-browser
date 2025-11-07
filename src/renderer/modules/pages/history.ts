import type { NavigationEntry } from 'electron'
import { A_PageWithTable } from '@home/modules/pages/abs_with_table'

import { Button } from '@home/modules/fragments/button'
import { Element } from '@home/modules/fragments'
import { Callout } from '@home/modules/fragments/callout'
import { TrLinked } from '@home/modules/fragments/tr-linked'
import { ShortcodeTable } from '@home/modules/fragments/table-shortcode'

import { ipcRenderer } from '@home/utils'
import {
    Channel,
    RequestHandler,
    TableAction,
    PageType,
    CTRL,
} from '@src/common/constants'

export class History extends A_PageWithTable<NavigationEntry> {
    order: 'ASC' | 'DESC' = 'DESC'
    readonly page = PageType.HISTORY

    constructor() {
        super()
        this.init()
    }

    protected init() {
        super.init()
        this.title.label = 'History'

        // Empty history
        const button = new Button({
            onClick: () => {
                ipcRenderer.send(Channel.HISTORY, RequestHandler.REMOVE)
                this.items = []
                this.refresh()
            },
        }).append('Empty History')
        this.buttonGroup.prepend(button)
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
        tr: TrLinked<{ index: number; data: NavigationEntry }>,
    ): Element<HTMLTableCellElement>[] {
        const history = tr.getData('data') as NavigationEntry
        const index = tr.getData('index') as number
        return [
            this.table.createTd(
                {
                    onClick: () => {
                        ipcRenderer.send(
                            Channel.HISTORY,
                            RequestHandler.EXECUTE,
                            this.order === 'ASC'
                                ? index
                                : this.items.length - index - 1,
                        )
                    },
                },
                new Element({ tag: 'span' }).append(history.title),
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
            ipcRenderer.send(
                Channel.HISTORY,
                RequestHandler.EXECUTE,
                this.order === 'ASC' ? index : this.items.length - index - 1,
            )
        }
    }

    refresh(): void {
        this._cursor = null
        this.renderTable()

        if (!window.controller.setting.helpText) {
            this.helpText.destroy()
            this.helpText = new Element({ tag: 'section' })
            return
        }

        const callout = new Callout({
            className: ['mb-4', 'max-w-2xl'],
        }).append(
            new ShortcodeTable({
                [`${CTRL}+F`]: 'Find from History',
                ['⬇︎']: 'Select History',
                Enter: 'Go to the selected History',
            }),
            new Element({
                tag: 'p',
                className: ['dark:text-gray-300', 'mb-2'],
            }).append('Press any key to find History.'),
        )

        this.helpText.append(callout)
    }
}
