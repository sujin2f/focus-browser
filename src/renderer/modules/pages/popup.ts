import {
    PageMode,
    PageType,
    TableAction,
    Channel,
    RequestHandler,
    type PopupBlocker as T_PopupBlocker,
} from '@src/types'

import { A_PageWithTable } from '.'
import Td from '@home/modules/fragments/td'
import Th from '@home/modules/fragments/th'
import Span from '@home/modules/fragments/span'
import type { DataListType } from '@home/modules/fragments/data-list'
import type Tr from '@home/modules/fragments/tr'
import { ipcRenderer } from '@src/renderer/util'

export default class PopupBlocker extends A_PageWithTable<T_PopupBlocker> {
    readonly page = PageType.POPUP_BLOCKER

    constructor() {
        super()
        this.init()
    }

    request(): void {
        ipcRenderer.send(Channel.POPUP_BLOCKER, RequestHandler.REQUEST)
        ipcRenderer.once(
            Channel.POPUP_BLOCKER,
            (
                handler: RequestHandler.RESPONSE,
                blocked: string[],
                allowed: string[],
            ) => {
                if (handler !== RequestHandler.RESPONSE) {
                    return
                }

                const data = [
                    ...allowed.map((host) => ({ host, allowed: true })),
                    ...blocked.map((host) => ({ host, allowed: false })),
                ]
                this.action(TableAction.UPDATE, data)
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
        const allowed = this.createFixedCell('th')
        allowed.innerHTML = 'Allowed'

        const title = new Th()
        title.innerHTML = 'Title'
        title.classList.add('text-left')

        return [allowed, title]
    }

    getRowCells(
        tr: DataListType<Tr>,
        popup: T_PopupBlocker,
        index: number,
    ): Td[] {
        const allowed = this.createFixedCell()
        const title = new Td()

        allowed.element.addEventListener('click', () => {
            this._cursor = tr
            this.action(TableAction.EXECUTE)
            this._cursor = null
        })

        title.element.addEventListener('click', () => {
            this._cursor = tr
            this.action(TableAction.EXECUTE)
            this._cursor = null
        })

        const spanAllowed = new Span()
        spanAllowed.innerHTML = popup.allowed ? '✅' : ''
        allowed.child = spanAllowed

        const spanTitle = new Span()
        spanTitle.innerHTML = popup.host
        title.child = spanTitle

        return [allowed, title]
    }

    filterCondition(item: T_PopupBlocker): boolean {
        return item.host
            .toLowerCase()
            .includes(this.searchKeyword.toLowerCase())
    }

    action(action: TableAction, items: T_PopupBlocker[] = []) {
        super.action(action, items)

        if (
            action === TableAction.DELETE ||
            action === TableAction.EXECUTE ||
            action === TableAction.EDIT
        ) {
            const data = this._cursor.getData('data') as T_PopupBlocker
            ipcRenderer.send(
                Channel.POPUP_BLOCKER,
                RequestHandler.MODIFY,
                data.host,
            )
            data.allowed = !data.allowed
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
