import { A_List } from '@src/renderer/src/entty-points/abs-list'
/* Utils */
import {
    checkElectron,
    ipcRenderer,
    navigate,
    getSection,
    tagNameIs,
} from '@src/renderer/src/utils'
/* <HTML Fragments /> */
import { H1 } from '@src/renderer/src/fragments/h1'
import { Button } from '@src/renderer/src/fragments/button'
import { BackButton } from '@src/renderer/src/fragments/back-button'
import { ListRow } from '@src/renderer/src/fragments/list-row'
import { Notification } from '@src/renderer/src/fragments/notification'
import { Modal } from '@src/renderer/src/fragments/modal'
import { Input } from '@src/renderer/src/fragments/input'
/* CONSTANTS */
import { IPC_CHANNELS, RequestHandler } from '@src/common/constants'
/* T_Types */
import type { T_Bookmark } from '@src/common/types'

class Bookmarks extends A_List<T_Bookmark> {
    protected isSearchActivated() {
        return !this.modal.activated
    }

    private notification: Notification = new Notification().appendTo('root')

    private editIndex = NaN
    private modal = new Modal().appendTo('root')
    private title = new Input('Title', 'title').appendTo(this.modal.content)
    private url = new Input('URL', 'url').appendTo(this.modal.content)
    private shortcut = new Input('Shortcut', 'url').appendTo(this.modal.content)
    private submit: Button

    constructor() {
        super()
        this.requestInfo('title', 'url')
        this.request()

        // Title
        const h1 = new H1('Bookmarks 🔖').prependTo('title')
        new BackButton().prependTo(h1.element)

        // Buttons
        new Button('Add Bookmark').appendTo('buttons').setOnClick(() => {
            this.title.value = this.settings.title || ''
            this.url.value = this.settings.url || ''
            this.shortcut.value = ''

            this.modal.show()
        })

        const formButtons = document.createElement('div')
        formButtons.classList.add('flex', 'justify-between')
        this.modal.content.append(formButtons)

        // Submit Change
        this.submit = new Button('Save Changes')
            .appendTo(formButtons)
            .setOnClick(() => {
                this.submit.disable()

                if (this.editIndex) {
                    ipcRenderer.send(
                        IPC_CHANNELS.BOOKMARK,
                        RequestHandler.MODIFY,
                        {
                            title: this.title.value.toString(),
                            url: this.url.value.toString(),
                            shortcut: this.shortcut.value.toString(),
                        } satisfies T_Bookmark,
                        this.editIndex,
                    )
                    return
                }

                ipcRenderer.send(IPC_CHANNELS.BOOKMARK, RequestHandler.ADD, {
                    title: this.title.value.toString(),
                    url: this.url.value.toString(),
                    shortcut: this.shortcut.value.toString(),
                } satisfies T_Bookmark)
            })

        // Remove
        new Button('🗑️', 'button-clear')
            .appendTo(formButtons)
            .setOnClick(() => {
                if (this.editIndex) {
                    ipcRenderer.send(
                        IPC_CHANNELS.BOOKMARK,
                        RequestHandler.REMOVE,
                        {},
                        this.editIndex,
                    )
                    return
                }
            })
    }

    protected callbackShortcut(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            if (this.modal.activated) {
                this.modal.hide()
                return
            }
        }

        super.callbackShortcut(e)
    }

    private request(): void {
        ipcRenderer.send(IPC_CHANNELS.BOOKMARK, RequestHandler.REQUEST)

        ipcRenderer.on(IPC_CHANNELS.BOOKMARK, (...args: unknown[]) => {
            const handler = args[0] as RequestHandler
            if (handler !== RequestHandler.RESPONSE) {
                return
            }

            this.items = args[1] as T_Bookmark[]
            const updated = args[2] as boolean

            this.modal.hide()
            this.submit.enable()

            if (updated) {
                this.notification.info('Bookmarks updated!')
            }

            this.listItems = this.items

            if (this.searchKeyword) {
                this.filterSearch()
            } else {
                this.renderList()
            }
        })
    }

    renderList() {
        getSection('list').innerHTML = ''
        this.listItems.forEach((bookmark, index) => {
            const row = new ListRow(bookmark.title, bookmark.url)
                .appendTo('list')
                .setOnClick((e: PointerEvent) => {
                    if (tagNameIs(e.target, 'button')) {
                        e.preventDefault()
                        return
                    }

                    navigate(bookmark.url)
                })

            new Button('⚙️', 'button-clear')
                .appendTo(row.suffix)
                .setOnClick(() => {
                    this.editIndex = index
                    this.title.value = bookmark.title
                    this.url.value = bookmark.url
                    this.shortcut.value = bookmark.shortcut || ''
                    this.modal.show()
                })

            if (bookmark.shortcut) {
                // Shortcut
                new Button(bookmark.shortcut.toUpperCase())
                    .prependTo(row.suffix)
                    .setOnClick(() => {
                        navigate(bookmark.url)
                    })
            }
        })
    }

    filterList(item: T_Bookmark, keyword: string): boolean {
        return (
            item.shortcut?.toLowerCase().includes(keyword) ||
            item.title.toLowerCase().includes(keyword)
        )
    }

    protected filterSearch(): void {
        if (!this.searchKeyword) {
            super.filterSearch()
            return
        }

        this.items.forEach((item) => {
            if (
                item.shortcut?.toLowerCase() ===
                this.searchKeyword.toLowerCase()
            ) {
                navigate(item.url)
                return
            }
        })

        super.filterSearch()
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Bookmarks()
})
