import { A_PageWithTable } from '@home/modules/pages/abs_with_table'
import { Controller } from '@home/modules/controller'

import { Element } from '@home/modules/fragments'
import { Button } from '@home/modules/fragments/button'
import { Input } from '@home/modules/fragments/input'
import { Form } from '@home/modules/fragments/form'
import { ButtonGroup } from '@home/modules/fragments/button-group'
import { Callout } from '@home/modules/fragments/callout'
import type { DataListType } from '@home/modules/fragments/data-list'

import { ipcRenderer, isMac, navigate, shortcutToHtml } from '@home/util'

import {
    Channel,
    PageMode,
    PageType,
    RequestHandler,
    TableAction,
    type Bookmark,
} from '@src/types'

export class Bookmarks extends A_PageWithTable<Bookmark> {
    order: 'ASC' | 'DESC' = 'ASC'

    readonly page = PageType.BOOKMARK

    // Add Form
    private form: Form = new Form()

    private inputTitle: Input
    private inputUrl: Input
    private inputShortcut: Input

    // Store Shortcut
    private shortcuts: Record<string, string> = {}

    // Shortcut temp store
    private shortcutKeyIn = ''

    constructor() {
        super()
        this.init()
    }

    protected init() {
        super.init()
        this.title.innerHTML = 'Bookmark'

        const buttonAdd: Button = new Button({
            onClick: this.onSwitchAdd.bind(this),
        })

        if (isMac()) {
            buttonAdd.append('Add Bookmark (⌘D)')
        } else {
            buttonAdd.append('Add Bookmark (Ctrl+D)')
        }

        this.buttonGroup.prepend(buttonAdd)

        this.renderModifyForm()

        this.inputFindKeyword.addEventListener(
            'keyup',
            this.onBookmarkShortcut.bind(this),
        )

        this.forms.append(this.form)
        this.hideForms()
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
                    Controller.getInstance().setting.title || ''
                this.inputUrl.value = Controller.getInstance().setting.url || ''
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

    cbInfoUpdated() {
        if (!Controller.getInstance().setting.helpText) {
            this.helpText.destroy()
            this.helpText = new Element('section')
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
        this.helpText.append(callout)
    }

    getTHeads(): Element<HTMLTableCellElement>[] {
        return [
            this.table.createFixedCell('th', {}, 'Shortcut'),
            this.table.createTh({ className: ['text-left'] }, 'Title'),
        ]
    }

    getRowCells(
        tr: DataListType<Element<HTMLTableRowElement>>,
    ): Element<HTMLTableCellElement>[] {
        const bookmark = tr.getData('data') as Bookmark
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
        this.inputTitle = new Input({ label: 'Title' })
        this.inputUrl = new Input({ label: 'URL' })
        this.inputShortcut = new Input({ maxLength: 2, label: 'Shortcut' })

        const buttonOk = new Button({ type: 'submit' }, 'OK (Enter)')
        const buttonCancel = new Button(
            {
                onClick: () => {
                    this.changeMode(PageMode.LIST)
                },
                type: 'reset',
            },
            'Cancel (Esc)',
        )

        const buttons = new ButtonGroup({}, buttonCancel, buttonOk)

        this.form = new Form(
            {
                onSubmit: (e) => {
                    e.preventDefault()
                    this.onEditSubmit()
                },
            },
            this.inputTitle,
            this.inputUrl,
            this.inputShortcut,
            buttons,
        )
    }

    filterCondition(item: Bookmark): boolean {
        return (
            item.title
                .toLowerCase()
                .includes(this.searchKeyword.toLowerCase()) ||
            item.url.toLowerCase().includes(this.searchKeyword.toLowerCase())
        )
    }

    /**
     * When Add/Edit form is submitted.
     */
    private onEditSubmit() {
        this.inputTitle.error = ''
        this.inputUrl.error = ''

        if (!this.inputTitle.value) {
            this.inputTitle.error = 'Title cannot be empty!'
            return
        }

        if (!this.inputUrl.value) {
            this.inputUrl.error = 'URL cannot be empty!'
            return
        }

        try {
            new URL(this.inputUrl.value)
        } catch {
            this.inputUrl.error = 'The value is not URL!'
            return
        }

        const bookmark = {
            title: this.inputTitle.value,
            url: this.inputUrl.value,
            shortcut: this.inputShortcut.value.toLowerCase(),
        }

        if (!this._cursor) {
            // Validate duplication
            const duplication = this.items.filter(
                (item) => item.url === bookmark.url,
            )
            if (duplication.length) {
                this.inputUrl.error = 'The URL is already registered!'
                return
            }

            ipcRenderer.send(Channel.BOOKMARK, RequestHandler.ADD, bookmark)
            this.items.unshift(bookmark)
        } else {
            const index = this._cursor.getData('index') as number

            ipcRenderer.send(
                Channel.BOOKMARK,
                RequestHandler.MODIFY,
                bookmark,
                this.order === 'ASC' ? index : this.items.length - index - 1,
            )

            this.items[index] = bookmark
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

            ipcRenderer.send(
                Channel.BOOKMARK,
                RequestHandler.REMOVE,
                this.order === 'ASC' ? index : this.items.length - index - 1,
            )
            this.items.splice(index, 1)
            this.refresh()

            return
        }
    }

    /**
     * User shortcut input
     * For non-English keyboard, extract English key stroke from KeyboardEvent
     */
    private onBookmarkShortcut(e: KeyboardEvent) {
        // Allow standard location only
        if (e.location !== e.DOM_KEY_LOCATION_STANDARD) {
            return
        }

        if (e.code.startsWith('Key')) {
            this.shortcutKeyIn += e.code.charAt(3)
        } else {
            this.shortcutKeyIn += e.key
        }

        const shortcut = this.shortcuts[this.shortcutKeyIn.toLowerCase()]
        if (shortcut) {
            navigate(shortcut)
            return true
        }
    }

    doShortcut(e: KeyboardEvent): boolean {
        // Add Bookmark ⌘D
        if (e.code === 'KeyD') {
            if ((isMac() && e.metaKey) || (!isMac() && e.ctrlKey)) {
                this.onSwitchAdd()
                return true
            }
        }

        if (super.doShortcut(e)) {
            return
        }

        // User input Shortcut or find
        if (
            document.activeElement.tagName.toLowerCase() !== 'input' &&
            e.location === e.DOM_KEY_LOCATION_STANDARD
        ) {
            this.shortcutKeyIn = ''
            this.changeMode(PageMode.FIND)
        }
    }

    private onSwitchAdd() {
        this.changeMode(PageMode.LIST)
        this.changeMode(PageMode.NEW)
    }

    protected arrowUp() {
        if (this._mode === PageMode.NEW || this._mode === PageMode.EDIT) {
            return
        }
        super.arrowUp()
    }

    protected arrowDown() {
        if (this._mode === PageMode.NEW || this._mode === PageMode.EDIT) {
            return
        }
        super.arrowDown()
    }
}
