import {
    type Bookmark,
    Channel,
    PageMode,
    PageType,
    RequestHandler,
    TableAction,
} from '@src/types'

import { A_PageWithTable } from '.'
import { Element } from '@home/modules/fragments'
import Button from '@home/modules/fragments/button'
import type { DataListType } from '@home/modules/fragments/data-list'
import { ipcRenderer, isMac, navigate, shortcutToHtml } from '@home/util'
import Heading from '../fragments/heading'
import Callout from '../fragments/callout'
import Controller from '../controller'

export default class Anchors extends A_PageWithTable<Bookmark> {
    readonly page = PageType.ANCHOR

    constructor() {
        super()
        this.init()
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

    render() {
        this.root.innerHTML = ''

        this.renderButtons()
        this.renderFindForm()
        this.renderTable()
        this.hideForms()

        // H1
        const heading = new Heading(1, {}, 'Anchor')
        this.root.appendChild(heading.element)

        this.renderCallout()

        this.root.appendChild(this.buttons.element)
        this.root.appendChild(this.formFind.element)
        this.root.appendChild(this.table.element)
    }

    private renderCallout() {
        if (!Controller.getInstance().helpText) {
            return
        }
        const command = isMac() ? '⌘' : 'Ctrl+'
        const callout = new Callout(
            { className: ['mb-4'] },
            new Element(
                'p',
                { className: ['text-gray-300', 'mb-2'] },
                'Press ',
                ...shortcutToHtml(`${command}+/`),
                ' to add a current page to the anchor.',
            ),
            new Element(
                'p',
                { className: ['text-gray-300'] },
                'Anchor is a temporary bookmark that is automatically deleted once you visited.',
            ),
        )
        this.root.appendChild(callout.element)
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
        tr: DataListType<Element<HTMLTableRowElement>>,
        bookmark: Bookmark,
        index: number,
    ): Element<HTMLTableCellElement>[] {
        const title = this.table.createTd(
            {
                onClick: (e) => {
                    const tagName = (
                        e.target as HTMLElement
                    ).tagName.toLowerCase()
                    if (tagName === 'button') {
                        this._cursor = tr
                        this.action(TableAction.DELETE)
                        this._cursor = null
                        return
                    }

                    navigate(bookmark.url, RequestHandler.REMOVE)
                },
            },
            new Button(
                {
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
                        this._cursor = null
                    },
                },
                'Remove',
            ),
            new Element('span', {}, bookmark.title),
        )

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
}
