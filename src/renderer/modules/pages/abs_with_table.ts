import { A_Page } from '@home/modules/pages/abs_page'

import { Element } from '@home/modules/fragments'
import { DataTable } from '@src/renderer/modules/fragments/table-data'
import { Button } from '@home/modules/fragments/button'
import { Input } from '@home/modules/fragments/input'
import { Form } from '@home/modules/fragments/form'
import { ButtonGroup } from '@home/modules/fragments/button-group'
import { TrLinked } from '@home/modules/fragments/tr-linked'
import { Title } from '@home/modules/fragments/title'
import { TitleBar } from '@home/modules/fragments/title-bar'

import { PageMode, TableAction } from '@src/common/constants'
import { ctrlOrComm, isMac, navigate } from '@home/utils'

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
    protected title: Title = new Title()
    protected buttonGroup: ButtonGroup = new ButtonGroup()
    protected forms: Element<HTMLElement> = new Element({ tag: 'section' })
    protected helpText: Element<HTMLElement> = new Element({ tag: 'section' })
    protected tableWrapper: Element<HTMLElement> = new Element({
        tag: 'section',
    })

    /**
     * Table Navigation
     */
    protected _cursor: TrLinked<{ index: number; data: T }> | null = null

    // Table
    protected table: DataTable<{ index: number; data: T }> = new DataTable()

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

        if (!this.settings.frame) {
            new TitleBar(this.root)
        }

        this.buttonGroup.append(this.buttonFind)
        this.forms.append(this.formFind)
        this.tableWrapper.append(this.table)
        this.renderFindForm()

        this.root.append(
            this.title,
            this.buttonGroup,
            this.forms,
            this.helpText,
            this.tableWrapper,
        )

        this.buttonFind.append(`Find (${ctrlOrComm()}F)`)

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
        tr: TrLinked<{ index: number; data: T }>,
    ): Element<HTMLTableCellElement>[]
    protected renderTable() {
        this.table.reset()

        let prev: TrLinked<{ index: number; data: T }> | null = null

        this.items.forEach((item, index) => {
            const tr = new TrLinked<{ index: number; data: T }>({
                className: [...this.STYLE_HOVER],
            })

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
        let prev: TrLinked<{ index: number; data: T }> | null = null
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
                row.className(...this.STYLE_FOCUSED)
                return
            }
            row.className(...this.STYLE_FOCUSED.map((v) => `-${v}`))
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
            for (const tr of this.table.children) {
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
        prev: TrLinked<{ index: number; data: T }> | null,
        tr: TrLinked<{ index: number; data: T }>,
    ) {
        if (prev) {
            prev.next = tr
            tr.prev = prev
        } else {
            tr.prev = undefined
        }
        return tr
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

    public doShortcut(e: KeyboardEvent): boolean | 'findMode' {
        // Find Key ⌘F
        if (e.code === 'KeyF') {
            if ((isMac() && e.metaKey) || (!isMac() && e.ctrlKey)) {
                this.changeMode(PageMode.FIND)
                e.preventDefault()
                return true
            }
        }

        if (
            document.activeElement &&
            document.activeElement.tagName.toLowerCase() === 'input'
        ) {
            switch (e.key) {
                case 'ArrowDown':
                    if (!e.metaKey && !e.altKey && !e.shiftKey && !e.ctrlKey) {
                        this.arrowDown()
                        e.preventDefault()
                        return true
                    }
                    break
                case 'Escape':
                    this.searchKeyword = ''
                    this.filterTable()
                    this.changeMode(PageMode.LIST)
                    e.preventDefault()
                    break
            }
        } else {
            switch (e.key) {
                case 'Escape':
                    if (this._mode !== PageMode.LIST) {
                        this.searchKeyword = ''
                        this.filterTable()
                        this.changeMode(PageMode.LIST)
                        e.preventDefault()
                        return true
                    }
                    navigate()
                    e.preventDefault()
                    return true
                case 'ArrowUp':
                    this.arrowUp()
                    e.preventDefault()
                    return true

                case 'ArrowDown':
                    this.arrowDown()
                    e.preventDefault()
                    return true

                case 'Enter':
                    if (!this._cursor) {
                        return false
                    }
                    if ((isMac() && e.metaKey) || (!isMac() && e.ctrlKey)) {
                        this.action(TableAction.EDIT)
                        e.preventDefault()
                        return true
                    }
                    this.action(TableAction.EXECUTE)
                    e.preventDefault()
                    return true

                case ' ':
                    if (!this._cursor) {
                        return false
                    }
                    this.action(TableAction.EXECUTE)
                    e.preventDefault()
                    return true

                case 'Delete':
                    if (!this._cursor) {
                        return false
                    }
                    this.action(TableAction.DELETE)
                    e.preventDefault()
                    return true
            }
        }

        // User input Shortcut or find
        if (
            document.activeElement &&
            document.activeElement.tagName.toLowerCase() !== 'input' &&
            e.location === e.DOM_KEY_LOCATION_STANDARD
        ) {
            this.changeMode(PageMode.FIND)
            return 'findMode'
        }

        return super.doShortcut(e)
    }
}
