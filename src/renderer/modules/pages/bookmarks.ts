import { A_PageWithTable } from '.'
import { Element } from '@home/modules/fragments'
import Button from '@home/modules/fragments/button'
import Label from '@home/modules/fragments/label'
import Input from '@home/modules/fragments/input'
import Form from '@home/modules/fragments/form'
import type { DataListType } from '@home/modules/fragments/data-list'
import ButtonGroup from '@home/modules/fragments/button-group'
import Heading from '@home/modules/fragments/heading'

import { ipcRenderer, isMac, navigate, shortcutToHtml } from '@home/util'

import {
    Channel,
    PageMode,
    PageType,
    RequestHandler,
    TableAction,
    type Bookmark,
} from '@src/types'
import Callout from '../fragments/callout'
import Controller from '../controller'

export default class Bookmarks extends A_PageWithTable<Bookmark> {
    readonly page = PageType.BOOKMARK

    // Add Form
    private form: Form = new Form()
    private inputTitle: Input = new Input()
    private inputUrl: Input = new Input()
    private inputShortcut: Input = new Input()

    private shortcuts: Record<string, string> = {}

    private currentUrl: Bookmark = {
        url: '',
        title: '',
    }

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
                this.inputTitle.value = this.currentUrl.title
                this.inputUrl.value = this.currentUrl.url
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
            (
                handler: RequestHandler.RESPONSE,
                bookmarks: Bookmark[],
                title: string,
                url: string,
            ) => {
                if (handler !== RequestHandler.RESPONSE) {
                    return
                }

                this.action(TableAction.UPDATE, bookmarks)
                this.currentUrl = {
                    title: title || '',
                    url: url || '',
                }
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

        const heading = new Heading(1, {}, 'Bookmark')

        this.root.appendChild(heading.element)
        this.renderCallout()
        this.root.appendChild(this.buttons.element)
        this.root.appendChild(this.form.element)
        this.root.appendChild(this.formFind.element)
        this.root.appendChild(this.table.element)
    }

    private renderCallout() {
        if (!Controller.getInstance().helpText) {
            return
        }
        const command = isMac() ? '⌘' : 'Ctrl+'
        const callout = new Callout(
            { className: ['mb-4'] },
            new Element(
                'p',
                { className: ['text-gray-300', 'mb-2'] },
                'Press ',
                ...shortcutToHtml(`${command}+D`),
                ' to add a current page to the bookmark.',
            ),
            new Element(
                'p',
                { className: ['text-gray-300'] },
                'Once you register a shortcut to a bookmark, you can access there quickly',
                new Element('br'),
                'For example, if you set ',
                ...shortcutToHtml('A'),
                ', ',
                'press ',
                ...shortcutToHtml(`${command}+\``),
                ', ',
                ...shortcutToHtml('B'),
                ', and ',
                ...shortcutToHtml('A'),
            ),
        )
        this.root.appendChild(callout.element)
    }

    protected renderButtons() {
        this.buttons.innerHTML = ''
        const buttonAdd: Button = new Button({
            onClick: this.onSwitchAdd.bind(this),
        })

        if (isMac()) {
            buttonAdd.append('Add Bookmark (⌘D)')
        } else {
            buttonAdd.append('Add Bookmark (Ctrl+D)')
        }

        this.buttons.append(buttonAdd, this.buttonFind)
    }

    getTHeads(): Element<HTMLTableCellElement>[] {
        return [
            this.table.createFixedCell('th', {}, 'Shortcut'),
            this.table.createTh({ className: ['text-left'] }, 'Title'),
        ]
    }

    getRowCells(
        tr: DataListType<Element<HTMLTableRowElement>>,
        bookmark: Bookmark,
    ): Element<HTMLTableCellElement>[] {
        const shortcut = this.table.createFixedCell()
        if (bookmark.shortcut) {
            this.shortcuts[bookmark.shortcut.toLowerCase()] = bookmark.url
            const btnShortcut = new Button(
                {
                    className: ['pr-1', 'pl-1', '-mb-3', '-p-2'],
                    onClick: () => {
                        navigate(bookmark.url)
                    },
                },
                bookmark.shortcut.toUpperCase(),
            )
            shortcut.append(btnShortcut)
        }

        return [
            shortcut,
            this.table.createTd(
                {
                    onClick: (e) => {
                        const tagName = (
                            e.target as HTMLElement
                        ).tagName.toLowerCase()
                        if (tagName === 'button') {
                            this._cursor = tr
                            this.focusTable()
                            this.changeMode(PageMode.EDIT)
                            return
                        }

                        navigate(bookmark.url)
                    },
                },
                new Button(
                    {
                        className: ['mr-2', 'cursor-pointer', '-mb-3', '-p-2'],
                        onClick: () => {
                            this._cursor = tr
                            this.focusTable()
                            this.changeMode(PageMode.EDIT)
                        },
                    },
                    '⚙️',
                ),
                new Element('span', {}, bookmark.title),
            ),
        ]
    }

    private renderModifyForm() {
        const labelTitle = new Label({}, this.inputTitle)
        labelTitle.title = 'Title'

        const labelUrl = new Label({}, this.inputUrl)
        labelUrl.title = 'URL'

        this.inputShortcut.maxLength = 1
        const labelShortcut = new Label({}, this.inputShortcut)
        labelShortcut.title = 'Shortcut'

        const buttonOk = new Button({}, 'OK (Enter)')
        const buttonCancel = new Button(
            {
                onClick: () => {
                    this.changeMode(PageMode.LIST)
                },
            },
            'Cancel (Esc)',
        )
        buttonCancel.type = 'reset'

        const buttons = new ButtonGroup({}, buttonCancel, buttonOk)

        this.form = new Form()
        this.form.append(labelTitle, labelUrl, labelShortcut, buttons)
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
        if (e.key.toLowerCase() === 'd') {
            if ((isMac() && e.metaKey) || (!isMac() && e.ctrlKey)) {
                this.onSwitchAdd()
                return true
            }
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
