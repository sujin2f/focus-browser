import { type Bookmark, CC_Modes, CC_Pages, CC_TableAction } from '@src/types'
import Controller from '@src/renderer/controller'
import IPC from '@home/modules/ipc'

import { A_PageWithTable } from '.'
import Button from '@home/modules/fragments/button'
import Label from '@home/modules/fragments/label'
import Input from '@home/modules/fragments/input'
import Tr from '@home/modules/fragments/tr'
import Td from '@home/modules/fragments/td'

export default class Bookmarks extends A_PageWithTable<Bookmark> {
    readonly page = CC_Pages.Bookmark

    // Buttons
    private buttonAdd: Button = new Button()

    // Input Form
    private formInput: HTMLFormElement
    private formInputTitle: Input = new Input()
    private formInputUrl: Input = new Input()
    private formInputShortcut: Input = new Input()

    private shortcuts: Record<string, string> = {}

    constructor() {
        super()
        this.init()
    }

    protected hideForms() {
        super.hideForms()
        this.formInput.classList.add('hidden')
    }

    protected changeMode(mode: CC_Modes): boolean {
        if (!super.changeMode(mode)) {
            return
        }

        switch (mode) {
            case CC_Modes.NEW:
                this.formInputTitle.value =
                    Controller.getInstance().currentUrl.title
                this.formInputUrl.value =
                    Controller.getInstance().currentUrl.url
                this.formInputShortcut.value = ''

                this.hideForms()
                this.formInput.classList.remove('hidden')
                this.formInputTitle.focus()

                this.refresh()
                return

            case CC_Modes.EDIT:
                if (isNaN(this._cursor)) {
                    this.changeMode(CC_Modes.LIST)
                    return
                }

                const current = this.items[this._cursor]

                this.formInputTitle.value = current.title
                this.formInputUrl.value = current.url
                this.formInputShortcut.value = current.shortcut || ''

                this.hideForms()
                this.formInput.classList.remove('hidden')
                this.formInputTitle.focus()
                return
        }
    }

    request(): void {
        IPC.getInstance().requestBookmarks()
    }

    render() {
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
        this.buttonAdd.text = 'Add Bookmark (⌘D)'
        this.buttonAdd.addEventListener('click', () => {
            this.changeMode(CC_Modes.NEW)
        })

        this.buttons.appendChild(this.buttonAdd.element)
        this.buttons.appendChild(this.buttonFind.element)
    }

    renderTable() {
        this.tableWrapper.innerHTML = ''
        this.table.reset()
        this.table.th = 'Title'
        this.table.th = 'Shortcut'
        this.table.th = 'Edit'

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
                this.shortcuts[bookmark.shortcut.toLowerCase()] = bookmark.url
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
                this._cursor = index
                this.changeMode(CC_Modes.EDIT)
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
            this.changeMode(CC_Modes.LIST)
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

    filterCondition(item: Bookmark, keyword: string): boolean {
        return (
            item.title.toLowerCase().includes(keyword.toLowerCase()) ||
            item.url.toLowerCase().includes(keyword.toLowerCase())
        )
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

        if (isNaN(this._cursor)) {
            IPC.getInstance().addBookmark(bookmark)
            this.items.unshift(bookmark)
        } else {
            IPC.getInstance().editBookmark(this._cursor, bookmark)
            this.items[this._cursor] = bookmark
        }

        this.refresh()
        this.changeMode(CC_Modes.LIST)
    }

    action(action: CC_TableAction, items: Bookmark[] = []) {
        super.action(action, items)

        if (action === CC_TableAction.EXECUTE) {
            IPC.getInstance().navigate(this.items[this._cursor].url)
            return
        }

        if (action === CC_TableAction.EDIT) {
            this.changeMode(CC_Modes.EDIT)
            return
        }

        if (action === CC_TableAction.DELETE) {
            if (isNaN(this._cursor)) {
                return
            }

            IPC.getInstance().removeBookmark(this._cursor)
            this.items.splice(this._cursor, 1)
            this.refresh()

            return
        }
    }

    doShortcut(e: KeyboardEvent): boolean {
        // Add Bookmark ⌘D
        if (e.key.toLowerCase() === 'd' && e.metaKey) {
            this.changeMode(CC_Modes.NEW)
            return true
        }

        // Bookmark Shortcut
        if (document.activeElement.tagName.toLowerCase() !== 'input') {
            const shortcut = this.shortcuts[e.key.toLowerCase()]
            if (shortcut) {
                IPC.getInstance().navigate(shortcut)
                return true
            }
        }

        super.doShortcut(e)
    }
}
