import { type NavigationEntry } from 'electron'
import { CC_Modes, CC_Pages } from '@src/types'
import IPC from '@home/modules/ipc'

import A_Page from '.'
import Table from '@home/modules/fragments/table'
import Button from '@home/modules/fragments/button'
import Label from '@home/modules/fragments/label'
import Input from '@home/modules/fragments/input'
import Tr from '@home/modules/fragments/tr'
import Td from '@home/modules/fragments/td'

// TODO Empty Option
export default class History extends A_Page<NavigationEntry> {
    public readonly page = CC_Pages.History

    protected set cursor(cursor: number) {
        this._cursor = cursor
        if (this._cursor === -1) {
            this._current = NaN
        }
        this.focusTable()
    }

    // Buttons
    private buttons: HTMLElement
    private buttonFind: Button = new Button()

    // Table
    private tableWrapper: HTMLElement
    private table: Table = new Table()

    // Find Form
    private formFind: HTMLFormElement
    private formFindTitle: Input = new Input()

    public get mode() {
        return this._mode
    }
    public set mode(mode: CC_Modes) {
        if (this._mode === mode) {
            return
        }

        this._mode = mode

        switch (mode) {
            case CC_Modes.List:
                this.formFind.classList.add('hidden')
                this.refresh()
                return

            case CC_Modes.Find:
                this.formFindTitle.value = ''

                this.formFind.classList.remove('hidden')
                this.formFindTitle.focus()
                this.refresh()
                return
        }
    }

    constructor() {
        super()
        IPC.getInstance().requestHistory()
        this.render()
    }

    private render() {
        this.root.innerHTML = ''

        this.renderButtons()
        this.root.appendChild(this.buttons)

        this.renderFindForm()
        this.formFind.classList.add('hidden')
        this.root.appendChild(this.formFind)

        this.tableWrapper = document.createElement('section')
        this.tableWrapper.appendChild(this.table.element)
        this.root.appendChild(this.tableWrapper)
        this.renderTable()
    }

    private renderButtons() {
        this.buttonFind.text = 'Find in History (⌘F)'
        this.buttonFind.addEventListener('click', () => {
            this.mode = CC_Modes.Find
        })

        this.buttons = document.createElement('section')
        this.buttons.className = 'w-full flex justify-between'
        this.buttons.appendChild(this.buttonFind.element)
    }

    private renderTable() {
        this.tableWrapper.innerHTML = ''
        this.table.reset()
        this.table.th = 'Title'

        this._numRows = this.items.length

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

    private renderFindForm() {
        this.formFind = document.createElement('form')
        const labelFindTitle = new Label()
        labelFindTitle.innerHTML = 'Keyword'
        labelFindTitle.child = this.formFindTitle

        this.formFind.appendChild(labelFindTitle.element)

        this.formFindTitle.addEventListener('keyup', (e) => {
            const keyword = this.formFindTitle.value
            this.filterTable(keyword)
        })
    }

    private filterTable(keyword = '') {
        const rows = this.table.children
        this._numRows = keyword ? 0 : this.items.length
        this.items.forEach((item, index) => {
            if (!keyword) {
                rows[index].show()
                return
            }

            if (
                item.title.toLowerCase().includes(keyword.toLowerCase()) ||
                item.url.toLowerCase().includes(keyword.toLowerCase())
            ) {
                rows[index].show()
                this._numRows++
                return
            }

            rows[index].hide()
        })
    }

    private focusTable() {
        this._current = NaN
        let hidden = 0
        this.table.children.forEach((row, index) => {
            if (row.hidden) {
                hidden++
                return
            }

            if (index - hidden === this._cursor) {
                row.element.setAttribute(
                    'class',
                    'border-l border-l-fuchsia-600 border-l-4',
                )
                this._current = (row as Tr).dataIndex
                return
            }

            row.element.setAttribute(
                'class',
                'border-l border-l-transparent border-l-4',
            )
        })
    }

    arrowUp() {
        if (this._cursor > 0) {
            this.cursor = this._cursor - 1
        }
    }

    arrowDown() {
        if (this._cursor < this._numRows - 1) {
            this.cursor = this._cursor + 1
            this.formFindTitle.blur()
        }
    }

    public onEnter() {
        if (isNaN(this._current)) {
            return
        }
        IPC.getInstance().navigate(this.items[this._current].url)
    }

    public read(history: NavigationEntry[]): void {
        this.items = history
        this.refresh()
    }

    public refresh(): void {
        this._current = NaN
        this._cursor = -1
        this._numRows = this.items.length
        this.renderTable()
    }

    public action(action: string, key: string) {
        if (action !== 'keypress') {
            return
        }

        if (key.length === 1) {
            this.mode = CC_Modes.Find
        }
    }

    create(...arg: unknown[]): void {
        throw new Error('Method not implemented.')
    }
    update(...arg: unknown[]): void {
        throw new Error('Method not implemented.')
    }
    delete(...arg: unknown[]): void {
        throw new Error('Method not implemented.')
    }
}
