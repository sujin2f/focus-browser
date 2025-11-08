import { Element } from '@home/modules/fragments'
import { Heading } from '@home/modules/fragments/heading'

import { isMac, shortcutToHtml } from '@src/renderer/utils'

export class ShortcodeTable extends Element<HTMLDivElement> {
    private get tableHeading() {
        return new Heading(2, { className: ['w-full', 'text-left'] }).append(
            'Keyboard Shortcuts',
        )
    }

    private _tbody: Element<HTMLTableElement>
    private get tbody() {
        if (!this._tbody) {
            this._tbody = new Element<HTMLTableElement>({
                tag: 'tbody',
            })
        }
        return this._tbody
    }

    private get tr() {
        return new Element<HTMLTableRowElement>({
            tag: 'tr',
        })
    }

    private getTd(...className: string[]) {
        return new Element<HTMLTableCellElement>({
            tag: 'td',
            className: ['pb-4', 'pr-2', ...className],
        })
    }

    private get table() {
        return new Element<HTMLTableElement>({
            tag: 'table',
            className: ['table-auto', 'min-w-max', 'border-collapse', 'w-full'],
        }).append(this.tbody)
    }

    constructor(data: Record<string, string>) {
        super({ tag: 'div', className: ['w-full'] })

        const table = this.table
        const width = isMac() ? 'w-25' : 'w-30'

        this.tbody.append(
            ...Object.keys(data).map((key) =>
                this.tr.append(
                    this.getTd(width, 'text-right').append(
                        ...shortcutToHtml(key),
                    ),
                    this.getTd('text-left').append(data[key]),
                ),
            ),
        )

        this.append(this.tableHeading, table)
    }
}
