import {
    PageMode,
    PageType,
    TableAction,
    PopupBlocker as T_PopupBlocker,
} from '@src/types'
import IPC from '@home/modules/ipc'

import { A_PageWithTable } from '.'
import Td from '@home/modules/fragments/td'
import Th from '../fragments/th'
import Span from '../fragments/span'

export default class PopupBlocker extends A_PageWithTable<T_PopupBlocker> {
    readonly page = PageType.POPUP_BLOCKER

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
        const allowed = this.createFixedCell('th')
        allowed.innerHTML = 'Allowed'

        const title = new Th()
        title.innerHTML = 'Title'
        title.classList.add('text-left')

        return [allowed, title]
    }

    getRowCells(popup: T_PopupBlocker, index: number): Td[] {
        const allowed = this.createFixedCell()
        const title = new Td()

        allowed.element.addEventListener('click', () => {
            this.cursor = index
            this.action(TableAction.EXECUTE)
            this.cursor = NaN
        })

        title.element.addEventListener('click', () => {
            this.cursor = index
            this.action(TableAction.EXECUTE)
            this.cursor = NaN
        })

        const spanAllowed = new Span()
        spanAllowed.innerHTML = popup.allowed ? '✅' : ''
        allowed.child = spanAllowed

        const spanTitle = new Span()
        spanTitle.innerHTML = popup.host
        title.child = spanTitle

        return [allowed, title]
    }

    filterCondition(item: T_PopupBlocker, keyword: string): boolean {
        return item.host.toLowerCase().includes(keyword.toLowerCase())
    }

    action(action: TableAction, items: T_PopupBlocker[] = []) {
        super.action(action, items)

        if (
            action === TableAction.DELETE ||
            action === TableAction.EXECUTE ||
            action === TableAction.EDIT
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
            this.changeMode(PageMode.FIND)
        }
    }
}
