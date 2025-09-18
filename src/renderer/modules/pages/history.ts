import { type NavigationEntry } from 'electron'
import { CC_Modes, CC_Pages, CC_TableAction } from '@src/types'
import IPC from '@home/modules/ipc'

import { A_PageWithTable } from '.'
import Button from '@home/modules/fragments/button'
import Tr from '@home/modules/fragments/tr'
import Td from '@home/modules/fragments/td'

export default class History extends A_PageWithTable<NavigationEntry> {
    readonly page = CC_Pages.History

    constructor() {
        super()
        this.init()
    }

    request(): void {
        IPC.getInstance().requestHistory()
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

        this.items.reverse().forEach((item, index) => {
            const tr = new Tr()
            tr.dataIndex = this.items.length - index - 1
            tr.element.setAttribute(
                'class',
                'border-l border-l-transparent border-l-4',
            )

            // title
            const title = new Button()
            title.className = ''
            title.text = item.title
            title.type = 'button'
            title.className =
                'block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900'
            title.className = ''
            title.addEventListener('click', () => {
                IPC.getInstance().navigateHistory(tr.dataIndex)
            })

            const tdTitle = new Td()

            tdTitle.child = title

            tr.child = tdTitle

            this.table.child = tr
        })
        this.tableWrapper.appendChild(this.table.element)
    }

    filterCondition(item: NavigationEntry, keyword: string): boolean {
        return (
            item.title.toLowerCase().includes(keyword.toLowerCase()) ||
            item.url.toLowerCase().includes(keyword.toLowerCase())
        )
    }

    action(action: CC_TableAction, items: NavigationEntry[] = []) {
        super.action(action, items)

        if (
            action === CC_TableAction.EXECUTE ||
            action === CC_TableAction.EDIT
        ) {
            IPC.getInstance().navigate(this.items[this._cursor].url)
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
