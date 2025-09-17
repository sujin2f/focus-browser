import { type Bookmark, CC_Modes, CC_Pages } from '@src/types'
import Controller from '@src/renderer/controller'
import IPC from '@home/modules/ipc'

import A_Page from '.'
import Table from '@home/modules/fragments/table'
import Button from '@home/modules/fragments/button'
import Label from '@home/modules/fragments/label'
import Input from '@home/modules/fragments/input'
import Tr from '@home/modules/fragments/tr'
import Td from '@home/modules/fragments/td'

export default class Bookmarks extends A_Page<Bookmark> {
    public readonly page = CC_Pages.Bookmark

    protected set cursor(cursor: number) {
        this._cursor = cursor
        if (this._cursor === -1) {
            this._current = NaN
        }
        this.focusTable()
    }

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
                this.formInput.classList.add('hidden')
                this.formFind.classList.add('hidden')
                this.refresh()
                return

            case CC_Modes.New:
                this.formInputTitle.value =
                    Controller.getInstance().currentUrl.title
                this.formInputUrl.value =
                    Controller.getInstance().currentUrl.url
                this.formInputShortcut.value = ''

                this.formInput.classList.remove('hidden')
                this.formFind.classList.add('hidden')
                this.formInputTitle.focus()

                this.refresh()
                return

            case CC_Modes.Edit:
                if (isNaN(this._current)) {
                    this.mode = CC_Modes.List
                    return
                }

                const current = this.items[this._current]

                this.formInputTitle.value = current.title
                this.formInputUrl.value = current.url
                this.formInputShortcut.value = current.shortcut

                this.formInput.classList.remove('hidden')
                this.formFind.classList.add('hidden')
                this.formInputTitle.focus()
                return

            case CC_Modes.Find:
                this.formFindTitle.value = ''

                this.formInput.classList.add('hidden')
                this.formFind.classList.remove('hidden')
                this.formFindTitle.focus()
                this.refresh()
                return
        }
    }

    constructor() {
        super()
        IPC.getInstance().requestBookmarks()
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
        this.tableWrapper.appendChild(this.table.element)
        this.root.appendChild(this.tableWrapper)
        this.renderTable()
    }

    private renderButtons() {
        // TODO Shortcuts
        this.buttonAdd.text = 'Add Bookmark (⌘D)'
        this.buttonAdd.addEventListener('click', () => {
            this.mode = CC_Modes.New
        })
        this.buttonFind.text = 'Find in Bookmarks (⌘F)'
        this.buttonFind.addEventListener('click', () => {
            this.mode = CC_Modes.Find
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

        this._numRows = this.items.length

        this.items.forEach((bookmark, index) => {
            const tr = new Tr()
            tr.dataIndex = index
            tr.element.setAttribute(
                'class',
                'border-l border-l-transparent border-l-4',
            )

            // title
            const title = new Button()
            title.className = ''
            title.text = bookmark.title
            title.type = 'button'
            title.className =
                'block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900'
            title.className = ''
            title.addEventListener('click', () => {
                IPC.getInstance().navigate(bookmark.url)
            })

            // Shortcode
            const shortcut = new Button()
            shortcut.className = ''
            if (bookmark.shortcut) {
                shortcut.text = bookmark.shortcut.toUpperCase()
                shortcut.type = 'button'
                shortcut.className =
                    'block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900'
                shortcut.addEventListener('click', () => {
                    IPC.getInstance().navigate(bookmark.url)
                })
            }

            // Edit
            const edit = new Button()
            edit.className = ''
            edit.text = 'Edit'
            edit.addEventListener('click', () => {
                this._current = index
                this.mode = CC_Modes.Edit
            })

            const tdTitle = new Td()
            const tdShortcut = new Td()
            const tdEdit = new Td()

            tdTitle.child = title
            tdShortcut.child = shortcut
            tdEdit.child = edit

            tr.child = tdTitle
            tr.child = tdShortcut
            tr.child = tdEdit

            this.table.child = tr
        })
        this.tableWrapper.appendChild(this.table.element)
    }

    private renderModifyForm() {
        this.formInput = document.createElement('form')

        const labelTitle = new Label()
        labelTitle.innerHTML = 'Title'
        labelTitle.child = this.formInputTitle

        const labelUrl = new Label()
        labelUrl.innerHTML = 'URL'
        labelUrl.child = this.formInputUrl

        const labelShortcut = new Label()
        labelShortcut.innerHTML = 'Shortcut'
        labelShortcut.child = this.formInputShortcut
        this.formInputShortcut.maxLength = 1

        const buttonOk = new Button()
        buttonOk.text = 'OK (Enter)'
        const buttonCancel = new Button()
        buttonCancel.text = 'Cancel (Esc)'
        buttonCancel.type = 'reset'
        buttonCancel.addEventListener('click', () => {
            this.mode = CC_Modes.List
        })

        this.formInput.appendChild(labelTitle.element)
        this.formInput.appendChild(labelUrl.element)
        this.formInput.appendChild(labelShortcut.element)
        this.formInput.appendChild(buttonOk.element)
        this.formInput.appendChild(buttonCancel.element)
        this.formInput.addEventListener('submit', (e) => {
            e.preventDefault()
            this.onEditSubmit()
        })
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
        this.items.forEach((bookmark, index) => {
            if (!keyword) {
                rows[index].show()
                return
            }

            if (
                bookmark.title.toLowerCase().includes(keyword.toLowerCase()) ||
                bookmark.url.toLowerCase().includes(keyword.toLowerCase())
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

    delete(index: number = -1) {
        if (index === -1) {
            if (isNaN(this._current)) {
                return
            }

            this.deleteItem(this.items.at(this._current))
            return
        }
        const bookmark = this.items.at(index)
        if (!bookmark) {
            return
        }
        this.deleteItem(bookmark)
    }

    private deleteItem(bookmark: Bookmark) {
        let index = -1
        this.items.map((item, _index) => {
            if (JSON.stringify(item) === JSON.stringify(bookmark)) {
                index = _index
            }
        })
        if (index === -1) {
            return
        }

        IPC.getInstance().removeBookmark(index)
        this.items.splice(index, 1)
        this.refresh()
    }

    /**
     * Move to URL from shortcode
     * @param {string} key
     */
    action(key: string) {
        this.items.forEach((bookmark) => {
            if (!bookmark.shortcut) {
                return
            }
            if (key.toLowerCase() === bookmark.shortcut.toLowerCase()) {
                IPC.getInstance().navigate(bookmark.url)
            }
        })
    }

    private onEditSubmit() {
        // TODO Validation
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

        if (this._current === -1) {
            this.create(bookmark)
        } else {
            this.update(bookmark)
        }

        this.refresh()
        this.mode = CC_Modes.List
    }

    public onEnter() {
        if (isNaN(this._current)) {
            return
        }
        IPC.getInstance().navigate(this.items[this._current].url)
    }

    public refresh() {
        this._current = NaN
        this._cursor = -1
        this._numRows = this.items.length
        this.renderTable()
    }

    public create(bookmark: Bookmark): void {
        IPC.getInstance().addBookmark(bookmark)
        this.items.unshift(bookmark)
    }
    public read(bookmarks: Bookmark[]): void {
        this.items = bookmarks
        this.refresh()
    }
    public update(bookmark: Bookmark): void {
        IPC.getInstance().editBookmark(this._current, bookmark)
        this.items[this._current] = bookmark
    }
}
