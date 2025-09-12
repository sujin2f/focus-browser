import type { NavigationEntry } from 'electron'

import { Bookmark, CC_Pages } from '@src/types'
import Controller from '@src/renderer/controller'
import IPC from '@home/modules/ipc'
import Table from '@home/modules/fragments/table'
import Button from '@home/modules/fragments/button'
import Label from '../fragments/label'
import Input from '../fragments/input'
import Page from '.'
import Tr from '../fragments/tr'
import Td from '../fragments/td'

// TODO Find & Arrow Key navigation
export default class History extends Page {
    public readonly page = CC_Pages.History

    private history: NavigationEntry[] = []

    // Table
    private tableWrapper: HTMLElement
    private table: Table = new Table()

    // Find Form
    private formFind: HTMLFormElement
    private formFindTitle: Input = new Input()

    // Navigation
    private _cursor = -1
    private _current: Bookmark | null
    private _numRows = 0

    private set cursor(cursor: number) {
        this._cursor = cursor
        if (this._cursor === -1) {
            this._current = null
        }
        this.focusTable()
    }
    public getValue() {
        if (!this._current) {
            return null
        }
        return this._current.url
    }

    public get mode() {
        return this._mode
    }
    public set mode(mode: number) {
        // List
        if (mode === 0) {
            this._mode = 0
            this.cursor = -1

            this.formFind.classList.add('hidden')

            this.filterTable()
            return
        }

        // Find
        if (mode === 3) {
            this.cursor = -1

            this.formFindTitle.value = ''

            this.formFind.classList.remove('hidden')
            this.formFindTitle.focus()
        }

        this._mode = 1
    }

    constructor() {
        super()
        IPC.getInstance().requestHistory()
        this.render()
    }

    private render() {
        this.root.innerHTML = ''

        this.renderFindForm()
        this.formFind.classList.add('hidden')
        this.root.appendChild(this.formFind)

        this.tableWrapper = document.createElement('section')
        this.root.appendChild(this.tableWrapper)
        this.renderTable()
        this.root.appendChild(this.table.element)
    }

    private renderTable() {
        this.tableWrapper.innerHTML = ''
        this.table.reset()
        this.table.th = 'Title'
        this.table.th = 'Url'

        this._numRows = this.history.length

        this.history.reverse().forEach((history, index) => {
            const tr = new Tr()
            tr.element.setAttribute(
                'class',
                'border-l border-l-transparent border-l-4',
            )

            // title
            const title = new Button()
            title.className = ''
            title.text = history.title
            title.type = 'button'
            title.className =
                'block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900'
            title.className = ''
            title.addEventListener('click', () => {
                IPC.getInstance().navigateHistory(this._numRows - index - 1)
            })

            // URL
            const url = new Button()
            url.className = ''
            url.text = history.url
            url.type = 'button'
            url.className =
                'block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900'
            url.className = ''
            url.addEventListener('click', () => {
                IPC.getInstance().navigateHistory(this._numRows - index - 1)
            })

            const tdTitle = new Td()
            const tdUrl = new Td()
            tr.child = tdTitle
            tr.child = tdUrl

            this.table.child = tr
        })
        this.tableWrapper.appendChild(this.table.element)
    }

    private renderFindForm() {
        const labelText = new Label()
        labelText.innerHTML = 'Keyword'
        this.formFind = document.createElement('form')
        labelText.child = this.formFindTitle

        this.formFind.appendChild(labelText.element)

        this.formFindTitle.addEventListener('keyup', (e) => {
            const keyword = this.formFindTitle.value
            this.filterTable(keyword)
        })
    }

    // TODO
    private filterTable(keyword = '') {
        // const rows = this.table.rows
        // this._numRows = 0
        // Controller.getInstance().bookmarks.forEach((bookmark, index) => {
        //     if (!keyword) {
        //         rows[index].show()
        //         this._numRows++
        //         return
        //     }
        //     if (
        //         bookmark.title.includes(keyword) ||
        //         bookmark.url.includes(keyword)
        //     ) {
        //         rows[index].show()
        //         this._numRows++
        //         return
        //     }
        //     rows[index].hide()
        // })
    }

    // TODO
    private focusTable() {
        // this._current = null
        // let hidden = 0
        // this.table.rows.forEach((row, index) => {
        //     if (row.hidden) {
        //         hidden++
        //         return
        //     }
        //     if (index - hidden === this._cursor) {
        //         row.element.setAttribute(
        //             'class',
        //             'border-l border-l-fuchsia-600 border-l-4',
        //         )
        //         this._current = Controller.getInstance().bookmarks.at(index)
        //         return
        //     }
        //     row.element.setAttribute(
        //         'class',
        //         'border-l border-l-transparent border-l-4',
        //     )
        // })
    }

    arrowUp() {
        if (this._cursor > 0) {
            this.cursor = this._cursor - 1
        }
    }

    arrowDown() {
        if (this._cursor < this._numRows - 1) {
            this.cursor = this._cursor + 1
        }
    }

    update(history: NavigationEntry[]) {
        this.history = history
        this.renderTable()
    }
}
