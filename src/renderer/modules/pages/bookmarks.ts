import {
    type Bookmark,
    Channel,
    PageMode,
    PageType,
    RequestHandler,
    TableAction,
} from '@src/types'
import Controller from '@src/renderer/modules/controller'

import { A_PageWithTable } from '.'
import Button from '@home/modules/fragments/button'
import Label from '@home/modules/fragments/label'
import Input from '@home/modules/fragments/input'
import Td from '@home/modules/fragments/td'
import Form from '@home/modules/fragments/form'
import Th from '@home/modules/fragments/th'
import Span from '@home/modules/fragments/span'
import type { DataListType } from '@home/modules/fragments/data-list'
import type Tr from '@home/modules/fragments/tr'
import { ipcRenderer, navigate } from '@src/renderer/util'

export default class Bookmarks extends A_PageWithTable<Bookmark> {
    readonly page = PageType.BOOKMARK

    // Buttons
    private buttonAdd: Button = new Button()

    // Input Form
    private form: Form = new Form()
    private inputTitle: Input = new Input()
    private inputUrl: Input = new Input()
    private inputShortcut: Input = new Input()

    private shortcuts: Record<string, string> = {}

    constructor() {
        super()
        this.init()
    }

    protected hideForms() {
        super.hideForms()
        this.form.hide()
    }

    protected changeMode(mode: PageMode): boolean {
        if (!super.changeMode(mode)) {
            return
        }

        switch (mode) {
            case PageMode.NEW:
                this._cursor = null
                this.inputTitle.value =
                    Controller.getInstance().currentUrl.title
                this.inputUrl.value = Controller.getInstance().currentUrl.url
                this.inputShortcut.value = ''

                this.form.show()
                this.inputTitle.focus()
                return

            case PageMode.EDIT:
                if (!this._cursor) {
                    this.changeMode(PageMode.LIST)
                    return
                }

                const current = this._cursor.getData('data') as Bookmark

                this.inputTitle.value = current.title
                this.inputUrl.value = current.url
                this.inputShortcut.value = current.shortcut || ''

                this.form.show()
                this.inputTitle.focus()
                return
        }
    }

    request(): void {
        ipcRenderer.send(Channel.BOOKMARK, RequestHandler.REQUEST)

        ipcRenderer.once(
            Channel.BOOKMARK,
            (handler: RequestHandler.RESPONSE, bookmarks: Bookmark[]) => {
                if (handler !== RequestHandler.RESPONSE) {
                    return
                }

                this.action(TableAction.UPDATE, bookmarks)
            },
        )
    }

    render() {
        this.root.innerHTML = ''

        this.renderButtons()
        this.renderModifyForm()
        this.renderFindForm()
        this.renderTable()
        this.hideForms()

        this.root.appendChild(this.buttons)
        this.root.appendChild(this.form.element)
        this.root.appendChild(this.formFind.element)
        this.root.appendChild(this.table.element)
    }

    protected renderButtons() {
        this.buttonAdd.text = 'Add Bookmark (⌘D)'
        this.buttonAdd.addEventListener('click', this.onSwitchAdd.bind(this))

        this.buttons.appendChild(this.buttonAdd.element)
        this.buttons.appendChild(this.buttonFind.element)
    }

    getTHeads(): Th[] {
        const shortcut = this.createFixedCell('th')
        shortcut.innerHTML = 'Shortcut'

        const title = new Th()
        title.innerHTML = 'Title'
        title.classList.add('text-left')

        return [shortcut, title]
    }

    getRowCells(tr: DataListType<Tr>, bookmark: Bookmark): Td[] {
        const shortcut = this.createFixedCell()
        const title = new Td()

        title.element.addEventListener('click', (e) => {
            const tagName = (e.target as HTMLElement).tagName.toLowerCase()
            if (tagName === 'button') {
                this._cursor = tr
                this.focusTable()
                this.changeMode(PageMode.EDIT)
                return
            }

            navigate(bookmark.url)
        })

        if (bookmark.shortcut) {
            const btnShortcut = new Button()
            btnShortcut.classList.remove('mb-3', 'p-2')
            btnShortcut.classList.add('pr-1', 'pl-1')
            this.shortcuts[bookmark.shortcut.toLowerCase()] = bookmark.url
            btnShortcut.text = bookmark.shortcut.toUpperCase()
            btnShortcut.addEventListener('click', () => {
                navigate(bookmark.url)
            })
            shortcut.child = btnShortcut
        }

        // title
        const spanTitle = new Span()
        spanTitle.innerHTML = bookmark.title

        const edit = new Button()
        edit.classList.remove('mb-3', 'p-2')
        edit.classList.add('mr-2', 'cursor-pointer')
        edit.text = '⚙️'
        edit.addEventListener('click', () => {
            this._cursor = tr
            this.focusTable()
            this.changeMode(PageMode.EDIT)
        })

        title.child = edit
        title.child = spanTitle

        return [shortcut, title]
    }

    private renderModifyForm() {
        this.form.reset()

        const labelTitle = new Label()
        labelTitle.innerHTML = 'Title'
        labelTitle.child = this.inputTitle

        const labelUrl = new Label()
        labelUrl.innerHTML = 'URL'
        labelUrl.child = this.inputUrl

        const labelShortcut = new Label()
        labelShortcut.innerHTML = 'Shortcut'
        labelShortcut.child = this.inputShortcut
        this.inputShortcut.maxLength = 1

        const buttonOk = new Button()
        buttonOk.text = 'OK (Enter)'
        const buttonCancel = new Button()
        buttonCancel.text = 'Cancel (Esc)'
        buttonCancel.type = 'reset'
        buttonCancel.addEventListener('click', () => {
            this.changeMode(PageMode.LIST)
        })

        this.form.child = labelTitle
        this.form.child = labelUrl
        this.form.child = labelShortcut
        this.form.child = buttonOk
        this.form.child = buttonCancel
        this.form.addEventListener('submit', (e) => {
            e.preventDefault()
            this.onEditSubmit()
        })
    }

    filterCondition(item: Bookmark): boolean {
        return (
            item.title
                .toLowerCase()
                .includes(this.searchKeyword.toLowerCase()) ||
            item.url.toLowerCase().includes(this.searchKeyword.toLowerCase())
        )
    }

    private onEditSubmit() {
        // TODO Validation
        if (!this.inputTitle.value) {
            return
        }

        if (!this.inputUrl.value) {
            return
        }

        const bookmark = {
            title: this.inputTitle.value,
            url: this.inputUrl.value,
            shortcut: this.inputShortcut.value,
        }

        if (!this._cursor) {
            ipcRenderer.send(Channel.BOOKMARK, RequestHandler.ADD, bookmark)
            this.items.unshift(bookmark)
        } else {
            ipcRenderer.send(
                Channel.BOOKMARK,
                RequestHandler.MODIFY,
                bookmark,
                this._cursor.getData('index') as number,
            )

            this.items[this._cursor.getData('index') as number] = bookmark
        }

        this.refresh()
        this.changeMode(PageMode.LIST)
    }

    action(action: TableAction, items: Bookmark[] = []) {
        super.action(action, items)

        if (action === TableAction.EXECUTE) {
            navigate((this._cursor.getData('data') as Bookmark).url)
            return
        }

        if (action === TableAction.EDIT) {
            this.changeMode(PageMode.EDIT)
            return
        }

        if (action === TableAction.DELETE) {
            if (!this._cursor) {
                return
            }

            const index = this._cursor.getData('index') as number

            ipcRenderer.send(Channel.BOOKMARK, RequestHandler.REMOVE, index)
            this.items.splice(index, 1)
            this.refresh()

            return
        }
    }

    doShortcut(e: KeyboardEvent): boolean {
        // Add Bookmark ⌘D
        if (e.key.toLowerCase() === 'd' && e.metaKey) {
            this.onSwitchAdd()
            return true
        }

        // Bookmark Shortcut
        if (document.activeElement.tagName.toLowerCase() !== 'input') {
            const shortcut = this.shortcuts[e.key.toLowerCase()]
            if (shortcut) {
                navigate(shortcut)
                return true
            }
        }

        super.doShortcut(e)
    }

    private onSwitchAdd() {
        this.changeMode(PageMode.LIST)
        this.changeMode(PageMode.NEW)
    }
}
