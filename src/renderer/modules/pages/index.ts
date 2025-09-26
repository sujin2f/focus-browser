import { PageMode, PageType, TableAction } from '@src/types'

import { Element } from '@home/modules/fragments'
import Table from '@home/modules/fragments/table'
import Button from '@home/modules/fragments/button'
import Label from '@home/modules/fragments/label'
import Input from '@home/modules/fragments/input'
import Form from '@home/modules/fragments/form'
import DataList, { type DataListType } from '@home/modules/fragments/data-list'
import { isMac, navigate } from '@home/util'
import ButtonGroup from '../fragments/button-group'

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
        if (this.root) {
            this.root.innerHTML = ''
        }
    }

    protected init() {
        this.render()
    }

    /**
     * For additional actions
     */
    action(action: TableAction, ...arg: unknown[]) {
        if (action === TableAction.INFO) {
            this.render()
        }
    }
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

    abstract render(): void
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
    protected _cursor: DataListType<Element<HTMLTableRowElement>> | null = null

    // Buttons
    protected buttons: ButtonGroup = new ButtonGroup()
    protected buttonFind: Button = new Button({
        onClick: () => {
            this.changeMode(PageMode.FIND)
        },
    })

    // Find Form
    protected formFind: Form = new Form()
    protected inputFindKeyword: Input = new Input()
    protected searchKeyword: string = ''

    // Table
    protected table: Table = new Table()

    protected init() {
        super.init()

        if (isMac()) {
            this.buttonFind.append('Find (⌘F)')
        } else {
            this.buttonFind.append('Find (Ctrl+F)')
        }

        this.renderTableHeads()
        this.request()
    }

    abstract request(): void

    protected renderButtons() {
        this.buttons.append(this.buttonFind)
    }

    /**
     * Table related methods
     */
    abstract getTHeads(): Element<HTMLTableCellElement>[]
    abstract getRowCells(
        tr: DataListType<Element<HTMLTableRowElement>>,
        item: T,
        index: number,
    ): Element<HTMLTableCellElement>[]
    private renderTableHeads() {
        this.table.appendHead(...this.getTHeads())
    }
    protected renderTable() {
        this.table.reset()
        const ListTr = DataList(Element<HTMLTableRowElement>)
        let prev: DataListType<Element<HTMLTableRowElement>> | null = null
        this.items.forEach((item, index) => {
            const tr = new ListTr('tr', {
                className: [
                    'hover',
                    'cursor-pointer',
                    'text-sm',
                    'antialiased',
                    'font-normal',
                    'leading-normal',
                    'text-blue-gray-900',
                    ...this.STYLE_HOVER,
                ],
            }) as unknown as DataListType<Element<HTMLTableRowElement>>
            tr.setData('index', index)
            tr.setData('data', item)

            // TODO remove tr from prop
            tr.append(...this.getRowCells(tr, item, index))
            prev = this.linkTr(prev, tr)
            this.table.append(tr)
        })
    }

    protected readonly STYLE_FOCUSED = ['bg-gray-100', 'dark:bg-gray-800']
    protected readonly STYLE_HOVER = [
        'hover:bg-gray-100',
        'dark:hover:bg-gray-800',
    ]

    abstract filterCondition(item: T): boolean
    protected filterTable() {
        const rows = this.table.children
        let prev: DataListType<Element<HTMLTableRowElement>> | null = null
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

    private linkTr(
        prev: DataListType<Element<HTMLTableRowElement>> | null,
        tr: DataListType<Element<HTMLTableRowElement>>,
    ) {
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
        this.formFind = new Form()
        const labelFindTitle = new Label({}, this.inputFindKeyword)
        labelFindTitle.title = 'Keyword'
        this.formFind.append(labelFindTitle)

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
        super.action(action)

        if (action === TableAction.UPDATE) {
            this.items = items
            this._cursor = null
            this.render()
        }
    }

    public doShortcut(e: KeyboardEvent): boolean {
        // Find Key ⌘F
        if (e.key.toLowerCase() === 'f') {
            if ((isMac() && e.metaKey) || (!isMac() && e.ctrlKey)) {
                this.changeMode(PageMode.FIND)
                return true
            }
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
                    if ((isMac() && e.metaKey) || (!isMac() && e.ctrlKey)) {
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
