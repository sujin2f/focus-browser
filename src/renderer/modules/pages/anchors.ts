import {
    type Bookmark,
    Channel,
    PageMode,
    PageType,
    RequestHandler,
    TableAction,
} from '@src/types'

import { A_PageWithTable } from '.'
import Button from '@home/modules/fragments/button'
import Td from '@home/modules/fragments/td'
import Th from '@home/modules/fragments/th'
import Span from '@home/modules/fragments/span'
import type Tr from '@home/modules/fragments/tr'
import type { DataListType } from '@home/modules/fragments/data-list'
import { ipcRenderer, navigate } from '@src/renderer/util'

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

        this.root.appendChild(this.buttons)
        this.root.appendChild(this.formFind.element)
        this.root.appendChild(this.table.element)
    }

    getTHeads(): Th[] {
        const title = new Th()
        title.innerHTML = 'Title'
        title.classList.add('text-left')

        return [title]
    }

    getRowCells(tr: DataListType<Tr>, bookmark: Bookmark, index: number): Td[] {
        const title = new Td()

        title.element.addEventListener('click', (e) => {
            const tagName = (e.target as HTMLElement).tagName.toLowerCase()
            if (tagName === 'button') {
                this._cursor = tr
                this.action(TableAction.DELETE)
                this._cursor = null
                return
            }

            navigate(bookmark.url)
        })

        const spanTitle = new Span()
        spanTitle.innerHTML = bookmark.title

        const del = new Button()
        del.classList.remove('mb-3', 'p-2')
        del.classList.add('mr-2', 'cursor-pointer', 'pl-1', 'pr-1')
        del.text = 'Remove'
        del.addEventListener('click', () => {
            this._cursor = tr
            this.action(TableAction.DELETE)
            this._cursor = null
        })

        title.child = del
        title.child = spanTitle

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
