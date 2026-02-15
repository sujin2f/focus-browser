import { A_PageWithTable } from '@src/renderer/src/modules/pages/abs_with_table'

import { Element } from '@src/renderer/src/modules/fragments'
import { Button } from '@src/renderer/src/modules/fragments/button'
import { Input } from '@src/renderer/src/modules/fragments/input'
import { Form } from '@src/renderer/src/modules/fragments/form'
import { ButtonGroup } from '@src/renderer/src/modules/fragments/button-group'
import { Callout } from '@src/renderer/src/modules/fragments/callout'
import { TrLinked } from '@src/renderer/src/modules/fragments/tr-linked'
import { ShortcodeTable } from '@src/renderer/src/modules/fragments/table-shortcode'

import {
    ctrlOrComm,
    ipcRenderer,
    isMac,
    navigate,
} from '@src/renderer/src/utils'

import type { Bookmark } from '@src/common/types'
import {
    IPC_CHANNELS,
    PageMode,
    RequestHandler,
    TableAction,
    CENTRE_PAGES,
    CTRL,
} from '@src/common/constants'

export class Bookmarks extends A_PageWithTable<Bookmark> {
    order: 'ASC' | 'DESC' = 'ASC'

    readonly page = CENTRE_PAGES.BOOKMARK

    // Add Form
    private form: Form = new Form()

    private inputTitle!: Input
    private inputUrl!: Input
    private inputShortcut!: Input

    // Store Shortcut
    private shortcuts: Record<string, string> = {}

    // Shortcut temp store
    private shortcutKeyIn = ''

    constructor() {
        super()
        this.requestInfo('helpText', 'title', 'url')
        this.init()
    }

    protected init() {
        super.init()
        this.title.label = 'Bookmark'

        const buttonAdd: Button = new Button({
            onClick: this.onSwitchAdd.bind(this),
        })

        buttonAdd.append(`Add Bookmark (${ctrlOrComm()}D)`)

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
            return false
        }

        switch (mode) {
            case PageMode.NEW:
                this._cursor = null
                this.inputTitle.value = this.settings.title || ''
                this.inputUrl.value = this.settings.url || ''
                this.inputShortcut.value = ''

                this.form.show()
                this.inputTitle.focus()
                return true

            case PageMode.EDIT: {
                if (!this._cursor) {
                    this.changeMode(PageMode.LIST)
                    return true
                }

                const current = this._cursor.getData('data') as Bookmark

                this.inputTitle.value = current.title
                this.inputUrl.value = current.url
                this.inputShortcut.value = current.shortcut || ''

                this.form.show()
                this.inputTitle.focus()
                return true
            }
        }
        return false
    }

    request(): void {
        ipcRenderer.send(IPC_CHANNELS.BOOKMARK, RequestHandler.REQUEST)

        ipcRenderer.once(IPC_CHANNELS.BOOKMARK, (...args: unknown[]) => {
            const handler = args[0] as RequestHandler
            const bookmarks = args[1] as Bookmark[]

            if (handler !== RequestHandler.RESPONSE) {
                return
            }

            this.action(TableAction.UPDATE, bookmarks)
        })
    }

    refresh() {
        this._cursor = null
        this.renderTable()

        this.helpText.innerHTML = ''
        if (!this.settings.helpText) {
            return
        }

        const callout = new Callout({
            className: ['mb-4', 'max-w-2xl'],
        }).append(
            new ShortcodeTable({
                [`${CTRL}+D`]: 'Add a current page to the Bookmark',
                [`${CTRL}+F`]: 'Find from Bookmarks',
                ['⬇︎']: 'Select Bookmark',
                Enter: 'Go to the selected Bookmark',
                Del: 'Delete the selected Bookmark',
            }),
            new Element({
                tag: 'p',
                className: ['dark:text-gray-300', 'mb-2'],
            }).append(
                'Press any key to find Bookmark or navigate to Bookmark shortcut.',
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
        tr: TrLinked<{ index: number; data: Bookmark }>,
    ): Element<HTMLTableCellElement>[] {
        const bookmark = tr.getData('data') as Bookmark
        const shortcut = this.table.createFixedCell()
        if (bookmark.shortcut) {
            this.shortcuts[bookmark.shortcut.toLowerCase()] = bookmark.url
            const btnShortcut = new Button({
                className: ['pr-1', 'pl-1', '-mb-3', '-p-2'],
                onClick: () => {
                    navigate(bookmark.url)
                },
            }).append(bookmark.shortcut.toUpperCase())
            shortcut.append(btnShortcut)
        }

        return [
            shortcut,
            this.table.createTd(
                {
                    onClick: (e: PointerEvent) => {
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
                new Button({
                    className: ['mr-2', 'cursor-pointer', '-mb-3', '-p-2'],
                    onClick: () => {
                        this._cursor = tr
                        this.focusTable()
                        this.changeMode(PageMode.EDIT)
                    },
                }).append('⚙️'),
                new Element({ tag: 'span' }).append(bookmark.title),
            ),
        ]
    }

    private renderModifyForm() {
        this.inputTitle = new Input({ label: 'Title' })
        this.inputUrl = new Input({ label: 'URL' })
        this.inputShortcut = new Input({ maxLength: 2, label: 'Shortcut' })

        const buttonOk = new Button({ type: 'submit' }).append('OK (Enter)')
        const buttonCancel = new Button({
            onClick: () => {
                this.changeMode(PageMode.LIST)
            },
            type: 'reset',
        }).append('Cancel (Esc)')

        const buttons = new ButtonGroup({}).append(buttonCancel, buttonOk)

        this.form = new Form({
            onSubmit: (e) => {
                e.preventDefault()
                this.onEditSubmit()
            },
        }).append(this.inputTitle, this.inputUrl, this.inputShortcut, buttons)
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

            ipcRenderer.send(
                IPC_CHANNELS.BOOKMARK,
                RequestHandler.ADD,
                bookmark,
            )
            this.items.unshift(bookmark)
        } else {
            const index = this._cursor.getData('index') as number

            ipcRenderer.send(
                IPC_CHANNELS.BOOKMARK,
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

        if (action === TableAction.EXECUTE && this._cursor) {
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
                IPC_CHANNELS.BOOKMARK,
                RequestHandler.REMOVE,
                null,
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

        if (super.doShortcut(e) === 'findMode') {
            this.shortcutKeyIn = ''
            return true
        }
        return false
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
