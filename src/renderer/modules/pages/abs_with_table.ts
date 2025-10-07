import { A_Page } from '@home/modules/pages/abs_page'

import { Element } from '@home/modules/fragments'
import Table from '@home/modules/fragments/table'
import { Button } from '@home/modules/fragments/button'
import { Input } from '@home/modules/fragments/input'
import { Form } from '@home/modules/fragments/form'
import { ButtonGroup } from '@home/modules/fragments/button-group'
import Heading from '@home/modules/fragments/heading'
import DataList, { type DataListType } from '@home/modules/fragments/data-list'

import { PageMode, TableAction } from '@src/types'
import { isMac, navigate } from '@home/util'

/**
 * Page with Table
 * The HTML layout is :
 * - <title />
 * - <button-group />
 * - <forms />
 * - <help-text />
 * - <table-wrapper />
 */
export abstract class A_PageWithTable<T> extends A_Page {
    protected items: T[] = []
    abstract order: 'ASC' | 'DESC'

    // HTML Layout
    protected title: Heading = new Heading(1, {}, '')
    protected buttonGroup: ButtonGroup = new ButtonGroup()
    protected forms: Element<HTMLElement> = new Element('section')
    protected helpText: Element<HTMLElement> = new Element('section')
    protected tableWrapper: Element<HTMLElement> = new Element('section')

    /**
     * Table Navigation
     */
    protected _cursor: DataListType<Element<HTMLTableRowElement>> | null = null

    // Table
    protected table: Table = new Table()

    // Find Form
    protected formFind: Form = new Form()
    protected inputFindKeyword: Input = new Input({ label: 'Keyword' })
    protected searchKeyword: string = ''
    protected buttonFind: Button = new Button({
        onClick: () => {
            this.changeMode(PageMode.FIND)
        },
    })

    // Style
    protected readonly STYLE_FOCUSED = ['border-red-100', 'dark:border-red-800']
    protected readonly STYLE_HOVER = [
        'hover:bg-gray-100',
        'dark:hover:bg-gray-800',
    ]

    protected changeMode(mode: PageMode): boolean {
        if (!super.changeMode(mode)) {
            return false
        }

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

    protected hideForms() {
        this.formFind.hide()
    }

    protected init() {
        this.root.innerHTML = ''

        this.buttonGroup.append(this.buttonFind)
        this.forms.append(this.formFind)
        this.tableWrapper.append(this.table)
        this.renderFindForm()

        this.root.append(
            this.title.element,
            this.buttonGroup.element,
            this.forms.element,
            this.helpText.element,
            this.tableWrapper.element,
        )

        if (isMac()) {
            this.buttonFind.append('Find (⌘F)')
        } else {
            this.buttonFind.append('Find (Ctrl+F)')
        }

        // Heads
        this.table.appendHead(...this.getTHeads())

        // Disable Enter for Find form
        this.formFind.addEventListener('submit', (e) => e.preventDefault())

        this.hideForms()
        /**
         * Request IPC for settings
         */
        this.request()
    }

    /**
     * Find Form (Keyword Input)
     */
    private renderFindForm() {
        this.formFind.append(this.inputFindKeyword)

        // When the user types
        this.inputFindKeyword.addEventListener('keyup', () => {
            this.searchKeyword = this.inputFindKeyword.value
            this.filterTable()
        })
    }

    /**
     * Request table data
     */
    abstract request(): void

    /**
     * Table related methods
     */
    abstract getTHeads(): Element<HTMLTableCellElement>[]
    abstract getRowCells(
        tr: DataListType<Element<HTMLTableRowElement>>,
    ): Element<HTMLTableCellElement>[]
    private renderTable() {
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
                    'border-l-5',
                    'border-transparent',
                    ...this.STYLE_HOVER,
                ],
            }) as unknown as DataListType<Element<HTMLTableRowElement>>

            tr.setData('index', index)
            tr.setData('data', item)

            tr.append(...this.getRowCells(tr))
            prev = this.linkTr(prev, tr)

            this.table.appendBody(tr)
        })
    }

    /**
     * Filtering Table
     */
    abstract filterCondition(item: T): boolean
    private filterTable() {
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

    protected arrowUp() {
        if (this._cursor && this._cursor.prev) {
            this._cursor = this._cursor.prev
        }

        this.focusTable()
    }

    protected arrowDown() {
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
     * For update and refresh
     */
    protected refresh() {
        this._cursor = null
        this.renderTable()
    }

    action(action: TableAction, items: T[] = []) {
        super.action(action)

        if (action === TableAction.UPDATE) {
            if (this.order === 'ASC') {
                this.items = items
            } else {
                this.items = items.reverse()
            }
            this._cursor = null
            this.renderTable()
        }
    }

    public doShortcut(e: KeyboardEvent): boolean {
        // Find Key ⌘F
        if (e.code === 'KeyF') {
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
                    if (!this._cursor) {
                        return
                    }
                    if ((isMac() && e.metaKey) || (!isMac() && e.ctrlKey)) {
                        this.action(TableAction.EDIT)
                        return true
                    }
                    this.action(TableAction.EXECUTE)
                    return true

                case ' ':
                    if (!this._cursor) {
                        return
                    }
                    this.action(TableAction.EXECUTE)
                    return true

                case 'Delete':
                    if (!this._cursor) {
                        return
                    }
                    this.action(TableAction.DELETE)
                    return true
            }
        }

        return super.doShortcut(e)
    }
}
