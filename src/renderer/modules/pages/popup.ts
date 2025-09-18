import {
    CC_Modes,
    CC_Pages,
    CC_TableAction,
    PopupBlocker as T_PopupBlocker,
} from '@src/types'
import IPC from '@home/modules/ipc'

import { A_PageWithTable } from '.'
import Button from '@home/modules/fragments/button'
import Tr from '@home/modules/fragments/tr'
import Td from '@home/modules/fragments/td'

export default class PopupBlocker extends A_PageWithTable<T_PopupBlocker> {
    readonly page = CC_Pages.PopupBlocker

    constructor() {
        super()
        this.init()
    }

    request(): void {
        IPC.getInstance().requestPopupBlocker()
    }

    render() {
        this.root.innerHTML = ''

        this.renderButtons()
        this.root.appendChild(this.buttons)

        this.renderFindForm()
        this.root.appendChild(this.formFind.element)
        this.hideForms()

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
        this.table.th = 'Allowed'
        this.table.th = 'Toggle'

        this.items.reverse().forEach((item, index) => {
            const tr = new Tr()
            tr.dataIndex = this.items.length - index - 1
            tr.element.setAttribute(
                'class',
                'border-l border-l-transparent border-l-4',
            )

            // title
            const title = new Button()
            title.text = item.host
            title.type = 'button'
            title.className =
                'block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900'
            title.addEventListener('click', () => {
                this._cursor = index
                this.action(CC_TableAction.EXECUTE)
                this._cursor = NaN
            })

            // allowed
            const allowed = new Button()
            allowed.text = item.allowed ? 'V' : ''
            allowed.type = 'button'
            allowed.className =
                'block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900'
            allowed.addEventListener('click', () => {
                this._cursor = index
                this.action(CC_TableAction.EXECUTE)
                this._cursor = NaN
            })

            // Button
            const button = new Button()
            button.className = ''
            button.text = 'Toggle'
            button.addEventListener('click', () => {
                this._cursor = index
                this.action(CC_TableAction.EXECUTE)
                this._cursor = NaN
            })

            const tdTitle = new Td()
            const tdAllowed = new Td()
            const tdButton = new Td()

            tdTitle.child = title
            tdAllowed.child = allowed
            tdButton.child = button

            tr.child = tdTitle
            tr.child = tdAllowed
            tr.child = tdButton

            this.table.child = tr
        })
        this.tableWrapper.appendChild(this.table.element)
    }

    filterCondition(item: T_PopupBlocker, keyword: string): boolean {
        return item.host.toLowerCase().includes(keyword.toLowerCase())
    }

    action(action: CC_TableAction, items: T_PopupBlocker[] = []) {
        super.action(action, items)

        if (
            action === CC_TableAction.DELETE ||
            action === CC_TableAction.EXECUTE ||
            action === CC_TableAction.EDIT
        ) {
            IPC.getInstance().togglePopupBlocker(this.items[this._cursor].host)
            this.items[this._cursor].allowed = !this.items[this._cursor].allowed
            this.renderTable()
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
