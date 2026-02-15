import { A_PageWithTable } from '@src/renderer/src/modules/pages/abs_with_table'

import { Element } from '@src/renderer/src/modules/fragments'
import { Button } from '@src/renderer/src/modules/fragments/button'
import { Callout } from '@src/renderer/src/modules/fragments/callout'
import { TrLinked } from '@src/renderer/src/modules/fragments/tr-linked'
import { ShortcodeTable } from '@src/renderer/src/modules/fragments/table-shortcode'

import { ipcRenderer, navigate } from '@src/renderer/src/utils'
import type { Bookmark } from '@src/common/types'
import {
    IPC_CHANNELS,
    RequestHandler,
    TableAction,
    CENTRE_PAGES,
    CTRL,
} from '@src/common/constants'

export class Anchors extends A_PageWithTable<Bookmark> {
    public order: 'ASC' | 'DESC' = 'ASC'

    readonly page = CENTRE_PAGES.ANCHOR

    constructor() {
        super()
        this.requestInfo('helpText')
        this.init()
    }

    protected init() {
        super.init()
        this.title.label = 'Anchor'
    }

    request(): void {
        ipcRenderer.send(IPC_CHANNELS.ANCHOR, RequestHandler.REQUEST)
        ipcRenderer.once(IPC_CHANNELS.ANCHOR, (...args: unknown[]) => {
            const handler = args[0] as RequestHandler
            const anchors = args[1] as Bookmark[]

            if (handler !== RequestHandler.RESPONSE) {
                return
            }

            this.action(TableAction.UPDATE, anchors)
        })
    }

    refresh(): void {
        this._cursor = null
        this.renderTable()

        this.helpText.innerHTML = ''
        if (!this.settings.helpText) {
            return
        }

        const callout = new Callout({
            className: ['mb-4', 'max-w-2xl'],
        }).append(
            new Element({
                tag: 'p',
                className: ['dark:text-gray-300', 'mb-4'],
            }).append(
                'Anchor is a temporary bookmark that is automatically deleted once you visited.',
            ),
            new ShortcodeTable({
                [`${CTRL}+F`]: 'Find from Anchors',
                ['⬇︎']: 'Select Anchor',
                Enter: 'Go to the selected Anchor',
                Del: 'Delete the selected Anchor',
            }),
            new Element({
                tag: 'p',
                className: ['dark:text-gray-300', 'mb-2'],
            }).append('Press any key to find Anchor.'),
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

        if (
            (action === TableAction.EXECUTE || action === TableAction.EDIT) &&
            this._cursor
        ) {
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
                IPC_CHANNELS.ANCHOR,
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
