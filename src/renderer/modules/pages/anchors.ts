import { A_PageWithTable } from '@home/modules/pages/abs_with_table'

import { Element } from '@home/modules/fragments'
import { Button } from '@home/modules/fragments/button'
import { Callout } from '@home/modules/fragments/callout'
import { TrLinked } from '@home/modules/fragments/tr-linked'

import { ipcRenderer, isMac, navigate, shortcutToHtml } from '@home/util'
import type { Bookmark } from '@src/types'
import { Channel, RequestHandler, TableAction, PageType } from '@src/constants'

export class Anchors extends A_PageWithTable<Bookmark> {
    public order: 'ASC' | 'DESC' = 'ASC'

    readonly page = PageType.ANCHOR

    constructor() {
        super()
        this.init()
    }

    protected init() {
        super.init()
        this.title.label = 'Anchor'
    }

    request(): void {
        ipcRenderer.send(Channel.ANCHOR, RequestHandler.REQUEST)
        ipcRenderer.once(
            Channel.ANCHOR,
            (handler: RequestHandler.RESPONSE, anchors: Bookmark[]) => {
                if (handler !== RequestHandler.RESPONSE) {
                    return
                }

                this.action(TableAction.UPDATE, anchors)
            },
        )
    }

    refresh(): void {
        this._cursor = null
        this.renderTable()

        if (!window.controller.setting.helpText) {
            this.helpText.destroy()
            this.helpText = new Element({ tag: 'section' })
            return
        }
        const command = isMac() ? '⌘' : 'Ctrl+'
        const callout = new Callout({ className: ['mb-4'] }).append(
            new Element({
                tag: 'p',
                className: ['text-gray-300', 'mb-2'],
            }).append(
                'Click title above or press Esc to go back to switch to browser mode.',
            ),
            new Element({
                tag: 'p',
                className: ['text-gray-300', 'mb-2'],
            }).append(
                'Press ',
                ...shortcutToHtml(`${command}+/`),
                ' to add a current page to the anchor.',
            ),
            new Element({
                tag: 'p',
                className: ['text-gray-300'],
            }).append(
                'Anchor is a temporary bookmark that is automatically deleted once you visited.',
            ),
        )
        this.helpText.append(callout)
    }

    getTHeads(): Element<HTMLTableCellElement>[] {
        return [
            this.table.createTh(
                {
                    className: ['text-left'],
                },
                'Title',
            ),
        ]
    }

    getRowCells(
        tr: TrLinked<{ index: number; data: Bookmark }>,
    ): Element<HTMLTableCellElement>[] {
        const bookmark = tr.getData('data') as Bookmark

        const title = this.table
            .createTd(
                {
                    onClick: (e: PointerEvent) => {
                        const tagName = (
                            e.target as HTMLElement
                        ).tagName.toLowerCase()

                        if (tagName === 'button') {
                            return
                        }

                        navigate(bookmark.url, RequestHandler.REMOVE)
                    },
                },
                new Button({
                    className: [
                        'mr-2',
                        'cursor-pointer',
                        'pl-1',
                        'pr-1',
                        '-mb-3',
                        '-p-2',
                    ],
                    onClick: () => {
                        this._cursor = tr
                        this.action(TableAction.DELETE)
                    },
                }).append('Remove'),
            )
            .append(new Element({ tag: 'span' }).append(bookmark.title))

        return [title]
    }

    filterCondition(item: Bookmark): boolean {
        return (
            item.title
                .toLowerCase()
                .includes(this.searchKeyword.toLowerCase()) ||
            item.url.toLowerCase().includes(this.searchKeyword.toLowerCase())
        )
    }

    action(action: TableAction, items: Bookmark[] = []) {
        super.action(action, items)

        if (action === TableAction.EXECUTE || action === TableAction.EDIT) {
            navigate(
                (this._cursor.getData('data') as Bookmark).url,
                RequestHandler.REMOVE,
            )
            return
        }

        if (action === TableAction.DELETE) {
            if (!this._cursor) {
                return
            }

            ipcRenderer.send(
                Channel.ANCHOR,
                RequestHandler.REMOVE,
                (this._cursor.getData('data') as Bookmark).url,
            )
            this.items.splice(this._cursor.getData('index') as number, 1)
            this._cursor = null
            this.refresh()

            return
        }
    }
}
