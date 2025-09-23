import { PageMode, PageType, TableAction } from '@src/types'

import Table from '@home/modules/fragments/table'
import Button from '@home/modules/fragments/button'
import Label from '@home/modules/fragments/label'
import Input from '@home/modules/fragments/input'
import Form from '@home/modules/fragments/form'
import Tr from '@home/modules/fragments/tr'
import Td from '@home/modules/fragments/td'
import Th from '@home/modules/fragments/th'
import DataList, { type DataListType } from '@home/modules/fragments/data-list'
import { navigate } from '@src/renderer/util'

export default abstract class A_Page<T> {
    /**
     * Identifier
     */
    abstract readonly page: PageType

    /**
     * All starts with here
     */
    protected get root() {
        return document.getElementById('root')
    }

    constructor() {
        this.root.innerHTML = ''
    }

    /**
     * For additional actions
     */
    abstract action(action: TableAction, ...arg: unknown[]): void
    /**
     * Shortcut
     */
    public doShortcut(e: KeyboardEvent): boolean {
        if (e.key === 'Escape') {
            if (document.activeElement.tagName.toLowerCase() === 'input') {
                this.blur()
                return true
            }

            navigate()
            return true
        }

        return false
    }

    protected blur() {
        ;(document.activeElement as HTMLElement).blur()
    }
}

export abstract class A_PageWithTable<T> extends A_Page<T> {
    protected items: T[] = []

    /**
     * Modes like list, edit, find...
     */
    protected _mode: PageMode = PageMode.LIST
    protected hideForms() {
        this.formFind.hide()
    }
    protected changeMode(mode: PageMode): boolean {
        if (this._mode === mode) {
            return false
        }

        this._mode = mode
        this.hideForms()

        switch (mode) {
            case PageMode.LIST:
                return false

            case PageMode.FIND:
                this.formFind.show()
                this.inputFindKeyword.value = ''
                this.inputFindKeyword.focus()
                return false
        }

        return true
    }

    /**
     * Table Navigation
     */
    protected _cursor: DataListType<Tr> | null = null

    // Buttons
    protected buttons: HTMLElement
    protected buttonFind: Button = new Button()

    // Find Form
    protected formFind: Form = new Form()
    protected inputFindKeyword: Input = new Input()
    protected searchKeyword: string = ''

    // Table
    protected table: Table = new Table()

    protected init() {
        this.buttonFind.text = 'Find (⌘F)'
        this.buttonFind.addEventListener('click', () => {
            this.changeMode(PageMode.FIND)
        })

        this.buttons = document.createElement('section')
        this.buttons.className = 'w-full flex justify-between'

        this.render()
        this.renderTableHeads()
        this.request()
    }

    abstract request(): void
    abstract render(): void

    protected renderButtons() {
        this.buttons.appendChild(this.buttonFind.element)
    }

    /**
     * Table related methods
     */
    abstract getTHeads(): Th[]
    abstract getRowCells(tr: DataListType<Tr>, item: T, index: number): Td[]
    private renderTableHeads() {
        const header = new Tr()
        this.getTHeads().forEach((th) => (header.child = th))
        this.table.head = null
        this.table.head = header
    }
    protected renderTable() {
        this.table.reset()
        const ListTr = DataList(Tr)
        let prev: DataListType<Tr> | null = null
        this.items.forEach((item, index) => {
            const tr = new ListTr() as unknown as DataListType<Tr>
            tr.setData('index', index)
            tr.setData('data', item)
            tr.classList.add(
                'hover',
                'cursor-pointer',
                'text-sm',
                'antialiased',
                'font-normal',
                'leading-normal',
                'text-blue-gray-900',
                ...this.STYLE_HOVER,
            )

            this.getRowCells(tr, item, index).forEach((td) => (tr.child = td))
            prev = this.linkTr(prev, tr)
            this.table.child = tr
        })
    }
    protected createFixedCell(type: 'th' | 'td' = 'td'): Th | Td {
        const td = type === 'td' ? new Td() : new Th()
        td.classList.add(
            'sticky',
            'left-0',
            'indent-1',
            'bg-white',
            'dark:bg-gray-950',
            'w-1',
            'text-center',
        )
        return td
    }

    protected readonly STYLE_FOCUSED = ['bg-gray-100', 'dark:bg-gray-800']
    protected readonly STYLE_HOVER = [
        'hover:bg-gray-100',
        'dark:hover:bg-gray-800',
    ]

    abstract filterCondition(item: T): boolean
    protected filterTable() {
        const rows = this.table.children
        let prev: DataListType<Tr> | null = null
        this.table.children.forEach((tr, index) => {
            if (!this.searchKeyword) {
                rows[index].show()
                prev = this.linkTr(prev, tr)
                return
            }

            if (this.filterCondition(tr.getData('data') as T)) {
                rows[index].show()
                prev = this.linkTr(prev, tr)
                return
            }

            rows[index].hide()
        })

        if (this._cursor && this._cursor.hidden) {
            this._cursor = null
        }
    }

    protected focusTable() {
        this.table.children.forEach((row) => {
            if (row === this._cursor) {
                row.classList.add(...this.STYLE_FOCUSED)
                return
            }
            row.classList.remove(...this.STYLE_FOCUSED)
        })
    }

    private arrowUp() {
        if (this._cursor && this._cursor.prev) {
            this._cursor = this._cursor.prev
        }
        this.focusTable()
    }

    private arrowDown() {
        if (this._cursor && this._cursor.next) {
            this._cursor = this._cursor.next
        } else if (!this._cursor) {
            for (let tr of this.table.children) {
                if (!tr.hidden) {
                    this._cursor = tr
                    break
                }
            }
        }
        this.focusTable()
        this.blur()
    }

    private linkTr(prev: DataListType<Tr> | null, tr: DataListType<Tr>) {
        if (prev) {
            prev.next = tr
            tr.prev = prev
        } else {
            tr.prev = null
        }
        return tr
    }

    /**
     * Find Form (Keyword Input)
     */
    protected renderFindForm() {
        const labelFindTitle = new Label()
        labelFindTitle.innerHTML = 'Keyword'
        labelFindTitle.child = this.inputFindKeyword

        this.formFind.child = labelFindTitle

        // When the user types
        this.inputFindKeyword.addEventListener('keyup', () => {
            this.searchKeyword = this.inputFindKeyword.value
            this.filterTable()
        })
    }

    /**
     * For update and refresh
     */
    protected refresh() {
        this._cursor = null
        this.renderTable()
    }

    action(action: TableAction, items: T[] = []) {
        if (action === TableAction.UPDATE) {
            this.items = items
            this._cursor = null
            this.renderTable()
        }
    }

    public doShortcut(e: KeyboardEvent): boolean {
        // Find Key ⌘F
        if (e.key.toLowerCase() === 'f' && e.metaKey) {
            this.changeMode(PageMode.FIND)
            return true
        }

        if (document.activeElement.tagName.toLowerCase() === 'input') {
            switch (e.key) {
                case 'ArrowDown':
                    if (!e.metaKey && !e.altKey && !e.shiftKey && !e.ctrlKey) {
                        this.arrowDown()
                        return true
                    }
                case 'Escape':
                    this.changeMode(PageMode.LIST)
            }
        } else {
            switch (e.key) {
                case 'Escape':
                    if (this._mode !== PageMode.LIST) {
                        this.searchKeyword = ''
                        this.filterTable()
                        this.changeMode(PageMode.LIST)
                        return true
                    }
                    navigate()
                    return true
                case 'ArrowUp':
                    this.arrowUp()
                    return true

                case 'ArrowDown':
                    this.arrowDown()
                    return true

                case 'Enter':
                    if (e.metaKey) {
                        this.action(TableAction.EDIT)
                        return true
                    }
                    this.action(TableAction.EXECUTE)
                    return true

                case ' ':
                    this.action(TableAction.EXECUTE)
                    return true

                case 'Delete':
                    this.action(TableAction.DELETE)
                    return true
            }
        }

        return super.doShortcut(e)
    }
}
