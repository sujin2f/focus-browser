import { type NavigationEntry } from 'electron'
import { CC_Modes, CC_Pages, CC_TableAction } from '@src/types'
import IPC from '@home/modules/ipc'

import { A_PageWithTable } from '.'
import Td from '@home/modules/fragments/td'
import Th from '@home/modules/fragments/th'
import Span from '@home/modules/fragments/span'

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
        this.renderFindForm()
        this.renderTable()
        this.hideForms()

        this.root.appendChild(this.buttons)
        this.root.appendChild(this.formFind.element)
        this.root.appendChild(this.table.element)
    }

    private renderButtons() {
        this.buttons.appendChild(this.buttonFind.element)
    }

    getTHeads(): Th[] {
        const title = new Th()
        title.innerHTML = 'Title'
        title.classList.add('text-left')

        return [title]
    }

    getRowCells(history: NavigationEntry, index: number): Td[] {
        const title = new Td()
        title.element.addEventListener('click', () => {
            IPC.getInstance().navigateHistory(index)
        })

        const spanTitle = new Span()
        spanTitle.innerHTML = history.title
        title.child = spanTitle

        return [title]
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
