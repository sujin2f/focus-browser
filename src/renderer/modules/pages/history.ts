import type { NavigationEntry } from 'electron'
import { Controller } from '@home/modules/controller'
import { A_PageWithTable } from '@home/modules/pages/abs_with_table'

import { Button } from '@home/modules/fragments/button'
import { Element } from '@home/modules/fragments'
import { Callout } from '@home/modules/fragments/callout'
import { TrLinked } from '@home/modules/fragments/tr-linked'

import { ipcRenderer } from '@home/util'
import { Channel, RequestHandler, TableAction, PageType } from '@src/constants'

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

        // Empty history
        const button = new Button(
            {
                onClick: () => {
                    ipcRenderer.send(Channel.HISTORY, RequestHandler.REMOVE)
                    this.items = []
                    this.refresh()
                },
            },
            'Empty History',
        )
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

    getRowCells(tr: TrLinked): Element<HTMLTableCellElement>[] {
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

        if (!Controller.getInstance().setting.helpText) {
            this.helpText.destroy()
            this.helpText = new Element('section')
            return
        }
        const callout = new Callout(
            { className: ['mb-4'] },
            new Element(
                'p',
                { className: ['text-gray-300', 'mb-2'] },
                'Click title above or press Esc to go back to switch to browser mode.',
            ),
        )
        this.helpText.append(callout)
    }
}
