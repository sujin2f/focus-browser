import { type Bookmark, CC_Modes, CC_Pages, CC_TableAction } from '@src/types'
import IPC from '@home/modules/ipc'

import { A_PageWithTable } from '.'
import Button from '@home/modules/fragments/button'
import Tr from '@home/modules/fragments/tr'
import Td from '@home/modules/fragments/td'

export default class Anchors extends A_PageWithTable<Bookmark> {
    readonly page = CC_Pages.Anchor

    constructor() {
        super()
        this.init()
    }

    request(): void {
        IPC.getInstance().requestAnchors()
    }

    render() {
        this.root.innerHTML = ''

        this.renderButtons()
        this.root.appendChild(this.buttons)

        this.renderFindForm()
        this.formFind.classList.add('hidden')
        this.root.appendChild(this.formFind)

        this.tableWrapper = document.createElement('section')
        this.tableWrapper.appendChild(this.table.element)
        this.root.appendChild(this.tableWrapper)
        this.renderTable()
    }

    private renderButtons() {
        this.buttons.appendChild(this.buttonFind.element)
    }

    renderTable() {
        this.tableWrapper.innerHTML = ''
        this.table.reset()
        this.table.th = 'Title'
        this.table.th = 'Delete'

        this.items.forEach((bookmark, index) => {
            const tr = new Tr()
            tr.dataIndex = index
            tr.element.setAttribute(
                'class',
                'border-l border-l-transparent border-l-4',
            )

            // title
            const title = new Button()
            title.className = ''
            title.text = bookmark.title
            title.type = 'button'
            title.className =
                'block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900'
            title.className = ''
            title.addEventListener('click', () => {
                IPC.getInstance().navigate(bookmark.url, index)
            })

            // Delete
            const del = new Button()
            del.className = ''
            del.text = 'Delete'
            del.addEventListener('click', () => {
                this._cursor = index
                this.action(CC_TableAction.DELETE)
                this._cursor = NaN
            })

            const tdTitle = new Td()
            const tdEdit = new Td()

            tdTitle.child = title
            tdEdit.child = del

            tr.child = tdTitle
            tr.child = tdEdit

            this.table.child = tr
        })
        this.tableWrapper.appendChild(this.table.element)
    }

    filterCondition(item: Bookmark, keyword: string): boolean {
        return (
            item.title.toLowerCase().includes(keyword.toLowerCase()) ||
            item.url.toLowerCase().includes(keyword.toLowerCase())
        )
    }

    action(action: CC_TableAction, items: Bookmark[] = []) {
        super.action(action, items)

        if (
            action === CC_TableAction.EXECUTE ||
            action === CC_TableAction.EDIT
        ) {
            IPC.getInstance().navigate(
                this.items[this._cursor].url,
                this._cursor,
            )
            return
        }

        if (action === CC_TableAction.DELETE) {
            if (isNaN(this._cursor)) {
                return
            }

            IPC.getInstance().removeAnchor(this._cursor)
            this.items.splice(this._cursor, 1)
            this.refresh()

            return
        }
    }

    doShortcut(e: KeyboardEvent): boolean {
        if (super.doShortcut(e)) {
            return
        }

        if (e.key.length === 1) {
            this.changeMode(CC_Modes.FIND)
        }
    }
}
