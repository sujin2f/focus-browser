import { CC_Modes, CC_Pages, CC_TableAction } from '@src/types'
import IPC from '@home/modules/ipc'

import Table from '@home/modules/fragments/table'
import Button from '@home/modules/fragments/button'
import Label from '@home/modules/fragments/label'
import Input from '@home/modules/fragments/input'

export default abstract class A_Page<T> {
    /**
     * Identifier
     */
    abstract readonly page: CC_Pages

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
    abstract action(action: CC_TableAction, ...arg: unknown[]): void
    /**
     * Shortcut
     */
    public doShortcut(e: KeyboardEvent): boolean {
        if (e.key === 'Escape') {
            if (document.activeElement.tagName.toLowerCase() === 'input') {
                this.blur()
                return true
            }

            IPC.getInstance().navigate()
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
    protected _mode: CC_Modes = CC_Modes.LIST
    protected hideForms() {
        this.formFind.classList.add('hidden')
    }
    protected changeMode(mode: CC_Modes): boolean {
        if (this._mode === mode) {
            return false
        }

        this._mode = mode

        switch (mode) {
            case CC_Modes.LIST:
                this.hideForms()
                return false

            case CC_Modes.FIND:
                this.hideForms()
                this.formFind.classList.remove('hidden')
                this.inputFindKeyword.value = ''
                this.inputFindKeyword.focus()
                return false
        }

        return true
    }

    /**
     * Table Navigation
     */
    protected _cursor = NaN
    protected set cursor(cursor: number) {
        this._cursor = cursor
        this.focusTable()
    }

    // Buttons
    protected buttons: HTMLElement
    protected buttonFind: Button = new Button()

    // Find Form
    protected formFind: HTMLFormElement
    protected inputFindKeyword: Input = new Input()

    // Table
    protected tableWrapper: HTMLElement
    protected table: Table = new Table()

    protected init() {
        this.buttonFind.text = 'Find in Bookmarks (⌘F)'
        this.buttonFind.addEventListener('click', () => {
            this.changeMode(CC_Modes.FIND)
        })

        this.buttons = document.createElement('section')
        this.buttons.className = 'w-full flex justify-between'

        this.request()
        this.render()
    }

    abstract request(): void
    abstract render(): void

    abstract renderTable(): void
    protected renderFindForm() {
        this.formFind = document.createElement('form')
        const labelFindTitle = new Label()
        labelFindTitle.innerHTML = 'Keyword'
        labelFindTitle.child = this.inputFindKeyword

        this.formFind.appendChild(labelFindTitle.element)

        this.inputFindKeyword.addEventListener('keyup', (e) => {
            const keyword = this.inputFindKeyword.value
            this.filterTable(keyword)
        })
    }

    abstract filterCondition(item: T, keyword: string): boolean
    protected filterTable(keyword: string) {
        const rows = this.table.children
        this.items.forEach((item, index) => {
            if (!keyword) {
                rows[index].show()
                return
            }

            if (this.filterCondition(item, keyword.toLowerCase())) {
                rows[index].show()
                return
            }

            rows[index].hide()
        })
    }

    private focusTable() {
        this.table.children.forEach((row) => {
            if (this._cursor === row.dataIndex) {
                row.element.setAttribute(
                    'class',
                    'border-l border-l-fuchsia-600 border-l-4',
                )

                return
            }

            row.element.setAttribute(
                'class',
                'border-l border-l-transparent border-l-4',
            )
        })
    }

    private arrowUp() {
        if (this._cursor > 0) {
            this.cursor = this._cursor - 1
        }
    }

    private arrowDown() {
        if (isNaN(this._cursor)) {
            this.cursor = 0
        }
        if (this._cursor < this.items.length - 1) {
            this.cursor = this._cursor + 1
        }
        this.blur()
    }

    /**
     * For update and refresh
     */
    protected refresh() {
        this._cursor = NaN
        this.renderTable()
    }

    action(action: CC_TableAction, items: T[] = []) {
        if (action === CC_TableAction.UPDATE) {
            this.items = items
            this.refresh()
        }
    }

    public doShortcut(e: KeyboardEvent): boolean {
        // Find Key ⌘F
        if (e.key.toLowerCase() === 'f' && e.metaKey) {
            this.changeMode(CC_Modes.FIND)
            return true
        }

        if (document.activeElement.tagName.toLowerCase() === 'input') {
            switch (e.key) {
                case 'ArrowDown':
                    this.arrowDown()
                    return true
                case 'Escape':
                    this.changeMode(CC_Modes.LIST)
                    return true
            }
        } else {
            switch (e.key) {
                case 'ArrowUp':
                    this.arrowUp()
                    return true

                case 'ArrowDown':
                    this.arrowDown()
                    return true

                case 'Enter':
                    if (e.metaKey) {
                        this.action(CC_TableAction.EDIT)
                        return true
                    }
                    this.action(CC_TableAction.EXECUTE)
                    return true

                case ' ':
                    this.action(CC_TableAction.EXECUTE)
                    return true

                case 'Delete':
                    this.action(CC_TableAction.DELETE)
                    return true
            }
        }

        return super.doShortcut(e)
    }
}
