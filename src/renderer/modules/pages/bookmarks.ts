import { Bookmark, CC_Pages } from '@src/types'
import Controller from '@src/renderer/controller'
import IPC from '@home/modules/ipc'
import Table from '@home/modules/fragments/table'
import Button from '@home/modules/fragments/button'
import Page from '.'
import Input from '../fragments/input'

export default class Bookmarks extends Page {
    public readonly page = CC_Pages.Bookmark

    // Buttons
    private buttons: HTMLElement
    private buttonAdd: Button = new Button()
    private buttonFind: Button = new Button()

    // Table
    private tableWrapper: HTMLElement
    private table: Table = new Table()

    // Input Form
    private formInput: HTMLFormElement
    private formInputTitle: Input = new Input()
    private formInputUrl: Input = new Input()
    private formInputShortcut: Input = new Input()
    private _modifyIndex = -1

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
            this._modifyIndex = -1
            this.cursor = -1

            this.formInput.classList.add('hidden')
            this.formFind.classList.add('hidden')

            this.filterTable()
            return
        }

        // Add
        if (mode === 1) {
            this._modifyIndex = -1
            this.cursor = -1

            this.formInputTitle.value =
                Controller.getInstance().currentUrl.title
            this.formInputUrl.value = Controller.getInstance().currentUrl.url
            this.formInputShortcut.value = ''

            this.formInput.classList.remove('hidden')
            this.formFind.classList.add('hidden')
            this.formInputTitle.focus()

            this.filterTable()
        }

        // Edit
        if (mode === 2) {
            if (!this._current) {
                this.mode = 0
                return
            }

            this.formInputTitle.value = this._current.title
            this.formInputUrl.value = this._current.url
            this.formInputShortcut.value = this._current.shortcut

            this.formInput.classList.remove('hidden')
            this.formFind.classList.add('hidden')
            this.formInputTitle.focus()

            this.filterTable()
        }

        // Find
        if (mode === 3) {
            this._modifyIndex = -1
            this.cursor = -1

            this.formFindTitle.value = ''

            this.formInput.classList.add('hidden')
            this.formFind.classList.remove('hidden')
            this.formFindTitle.focus()
        }

        this._mode = 1
    }

    constructor() {
        super()

        if (!Controller.getInstance().bookmarks.length) {
            IPC.getInstance().requestBookmarks()
        }
        this.render()
    }

    private render() {
        this.root.innerHTML = ''

        this.renderButtons()
        this.root.appendChild(this.buttons)

        this.renderModifyForm()
        this.formInput.classList.add('hidden')
        this.root.appendChild(this.formInput)

        this.renderFindForm()
        this.formFind.classList.add('hidden')
        this.root.appendChild(this.formFind)

        this.tableWrapper = document.createElement('section')
        this.root.appendChild(this.tableWrapper)
        this.renderTable()
        this.root.appendChild(this.table.element)
    }

    public update() {
        this.renderTable()
    }

    private renderButtons() {
        this.buttonAdd.title = 'Add Bookmark (⌘D)'
        this.buttonAdd.addEventListener('click', () => {
            this.mode = 1
        })
        this.buttonFind.title = 'Find in Bookmarks (⌘F)'
        this.buttonFind.addEventListener('click', () => {
            this.mode = 3
        })

        this.buttons = document.createElement('section')
        this.buttons.className = 'w-full flex justify-between'
        this.buttons.appendChild(this.buttonAdd.element)
        this.buttons.appendChild(this.buttonFind.element)
    }

    private renderTable() {
        this.tableWrapper.innerHTML = ''
        this.table.reset()
        this.table.th = 'Title'
        this.table.th = 'Shortcut'
        this.table.th = 'Edit'

        this._numRows = Controller.getInstance().bookmarks.length

        Controller.getInstance().bookmarks.forEach((bookmark, index) => {
            const tr = this.table.createRow()
            tr.element.setAttribute(
                'class',
                'border-l border-l-transparent border-l-4',
            )

            // title
            const title = new Button()
            title.className = ''
            title.title = bookmark.title
            title.type = 'button'
            title.className =
                'block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900'
            title.className = ''
            title.addEventListener('click', () => {
                IPC.getInstance().switch(bookmark.url)
            })

            this.table.createCell().appendChild(title.element)

            // Shortcode
            const shortcut = new Button()
            shortcut.className = ''
            if (bookmark.shortcut) {
                shortcut.title = bookmark.shortcut.toUpperCase()
                shortcut.type = 'button'
                shortcut.className =
                    'block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900'
                shortcut.addEventListener('click', () => {
                    IPC.getInstance().switch(bookmark.url)
                })
            }

            this.table.createCell().appendChild(shortcut.element)

            // Edit
            const edit = new Button()
            edit.className = ''
            edit.title = 'Edit'
            edit.addEventListener('click', () => {
                this._current = bookmark
                this._modifyIndex = index
                this.mode = 2
            })

            this.table.createCell().appendChild(edit.element)
        })
        this.tableWrapper.appendChild(this.table.element)
    }

    private renderModifyForm() {
        this.formInput = document.createElement('form')
        this.formInputTitle.label = 'Title'
        this.formInputUrl.label = 'URL'
        this.formInputShortcut.label = 'Shortcut'
        const buttonOk = new Button()
        buttonOk.title = 'OK (Enter)'
        const buttonCancel = new Button()
        buttonCancel.title = 'Cancel (Esc)'

        this.formInput.appendChild(this.formInputTitle.element)
        this.formInput.appendChild(this.formInputUrl.element)
        this.formInput.appendChild(this.formInputShortcut.element)
        this.formInput.appendChild(buttonOk.element)
        this.formInput.appendChild(buttonCancel.element)
        this.formInput.addEventListener('submit', (e) => {
            e.preventDefault()
            this.onEditSubmit()
        })
    }

    private renderFindForm() {
        this.formFind = document.createElement('form')
        this.formFindTitle.label = 'Keyword'

        this.formFind.appendChild(this.formFindTitle.element)

        this.formFindTitle.addEventListener('keyup', (e) => {
            const keyword = this.formFindTitle.value
            this.filterTable(keyword)
        })
    }

    private filterTable(keyword = '') {
        const rows = this.table.rows
        this._numRows = 0
        Controller.getInstance().bookmarks.forEach((bookmark, index) => {
            if (!keyword) {
                rows[index].show()
                this._numRows++
                return
            }

            if (
                bookmark.title.includes(keyword) ||
                bookmark.url.includes(keyword)
            ) {
                rows[index].show()
                this._numRows++
                return
            }

            rows[index].hide()
        })
    }

    private focusTable() {
        this._current = null
        let hidden = 0
        this.table.rows.forEach((row, index) => {
            if (row.hidden) {
                hidden++
                return
            }

            if (index - hidden === this._cursor) {
                row.element.setAttribute(
                    'class',
                    'border-l border-l-fuchsia-600 border-l-4',
                )
                this._current = Controller.getInstance().bookmarks.at(index)
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
        }
    }

    remove(index: number = -1) {
        if (index === -1) {
            if (!this._current) {
                return
            }

            this.removeItem(this._current)
            return
        }
        const bookmark = Controller.getInstance().bookmarks.at(index)
        if (!bookmark) {
            return
        }
        this.removeItem(bookmark)
    }

    removeItem(bookmark: Bookmark) {
        let index = -1
        Controller.getInstance().bookmarks.map((item, _index) => {
            if (JSON.stringify(item) === JSON.stringify(bookmark)) {
                index = _index
            }
        })
        if (index === -1) {
            return
        }

        IPC.getInstance().removeBookmark(index)
        const bookmarks = [...Controller.getInstance().bookmarks]
        bookmarks.splice(index, 1)
        Controller.getInstance().bookmarks = bookmarks

        this.cursor = 0
    }

    action(key: string) {
        Controller.getInstance().bookmarks.forEach((bookmark) => {
            if (key.toLowerCase() === bookmark.shortcut.toLowerCase()) {
                IPC.getInstance().switch(bookmark.url)
            }
        })
    }

    private onEditSubmit() {
        if (!this.formInputTitle.value) {
            return
        }

        if (!this.formInputUrl.value) {
            return
        }

        const bookmark = {
            title: this.formInputTitle.value,
            url: this.formInputUrl.value,
            shortcut: this.formInputShortcut.value,
        }

        if (this._modifyIndex === -1) {
            IPC.getInstance().addBookmark(bookmark)
            Controller.getInstance().bookmarks = [
                bookmark,
                ...Controller.getInstance().bookmarks,
            ]
        } else {
            IPC.getInstance().editBookmark(this._modifyIndex, bookmark)
            const bookmarks = [...Controller.getInstance().bookmarks]
            bookmarks[this._modifyIndex] = bookmark
            Controller.getInstance().bookmarks = bookmarks
        }

        this._modifyIndex = 0
        this.mode = 0
    }
}
