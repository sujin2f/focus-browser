import { A_ListSearch } from '@src/renderer/src/entty-points/abs-list-search'
/* Utils */
import {
    checkElectron,
    ipcRenderer,
    navigate,
    getSection,
    tagNameIs,
} from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { H1 } from '@src/renderer/src/template-parts/h1'
import { Button } from '@src/renderer/src/template-parts/button'
import { BackButton } from '@src/renderer/src/template-parts/back-button'
import { ListItem } from '@src/renderer/src/template-parts/list-item'
import { Notification } from '@src/renderer/src/template-parts/notification'
import { Modal } from '@src/renderer/src/template-parts/modal'
import { Input } from '@src/renderer/src/template-parts/input'
import { Select } from '@src/renderer/src/template-parts/select'
import { Option } from '@src/renderer/src/template-parts/option'
/* CONSTANTS */
import { IPC_CHANNELS, RequestHandler } from '@src/common/constants'
/* T_Types */
import type { T_Bookmark } from '@src/common/types'

class Bookmarks extends A_ListSearch<T_Bookmark> {
    protected isSearchActivated() {
        return !this.modal.activated
    }

    private dirs: ListItem[] = []

    private notification: Notification = new Notification().appendTo('root')

    private editIndex = NaN
    private mode: 'bookmark' | 'dir' = 'bookmark'
    private modal = new Modal().appendTo('root')
    private title = new Input('Title', 'title').appendTo(this.modal.content)
    private url = new Input('URL', 'url').appendTo(this.modal.content)
    private shortcut = new Input('Shortcut', 'url').appendTo(this.modal.content)
    private folder = new Select('Folder', 'folder').appendTo(this.modal.content)
    private submit: Button

    constructor() {
        super()
        this.requestInfo('title', 'url')
        this.request()

        // Title
        const h1 = new H1('Bookmarks 🔖').prependTo('title')
        new BackButton().prependTo(h1.element)

        // Buttons >> Add Folder
        new Button('📁 Create Folder').appendTo('buttons').setOnClick(() => {
            this.showModal('dir')
        })

        const formButtons = document.createElement('div')
        formButtons.classList.add('flex', 'justify-between')
        this.modal.content.append(formButtons)

        // Submit Change
        this.submit = new Button('Save Changes')
            .appendTo(formButtons)
            .setOnClick(this.onSubmit.bind(this))

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

    protected callbackUpdateInfo(): void {
        if (this.settings.url) {
            // Buttons >> Add Bookmark
            new Button('💾 Add Bookmark')
                .prependTo('buttons')
                .setOnClick(() => {
                    this.showModal('bookmark', NaN, {
                        title: this.settings.title || '',
                        url: this.settings.url || '',
                    } satisfies T_Bookmark)
                    this.modal.show()
                })
        }
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
        this.folder.input.innerHTML = ''
        new Option('== Select Folder ==', '-1').appendTo(this.folder.input)

        this.listItems.forEach((bookmark, index) => {
            const isDir = !bookmark.url
            const hasParent = bookmark.parent || bookmark.parent === 0
            let title = bookmark.title

            if (isDir) {
                title = `📂 ${title}`
            }
            if (hasParent) {
                title = `- ${title}`
            }
            const row = new ListItem(title, bookmark.url)

            if (isDir) {
                this.dirs.push(row)
                new Option(bookmark.title, index.toString()).appendTo(
                    this.folder.input,
                )
            }

            if (hasParent) {
                row.appendTo(this.list.element)
            } else {
                row.appendTo(this.list.element)
            }

            row.setOnClick((e: PointerEvent) => {
                if (isDir) {
                    return
                }

                if (tagNameIs(e.target, 'button')) {
                    e.preventDefault()
                    return
                }
                navigate(bookmark.url)
            })

            // new Button('⚙️', 'button-clear')
            //     .appendTo(row.suffix)
            //     .setOnClick(() => {
            //         this.showModal(isDir ? 'dir' : 'bookmark', index, bookmark)
            //     })

            // if (bookmark.shortcut) {
            //     // Shortcut
            //     new Button(bookmark.shortcut.toUpperCase())
            //         .prependTo(row.suffix)
            //         .setOnClick(() => {
            //             if (isDir) {
            //                 return
            //             }
            //             navigate(bookmark.url)
            //         })
            // }
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

    private showModal(
        mode: 'bookmark' | 'dir',
        index: number = NaN,
        bookmark?: T_Bookmark,
    ) {
        this.mode = mode
        this.submit.enable()

        switch (mode) {
            case 'bookmark':
                this.url.show()
                this.folder.show()
                // Edit / New
                if (bookmark) {
                    this.editIndex = index
                    this.title.value = bookmark.title
                    this.url.value = bookmark.url
                    this.shortcut.value = bookmark.shortcut
                    this.modal.show()
                    this.title.focus()
                    return
                }

                break

            case 'dir':
                this.url.hide()
                this.folder.hide()
                this.editIndex = index
                this.title.value = bookmark?.title
                this.shortcut.value = bookmark?.shortcut
                this.modal.show()
                this.title.focus()
                return
        }
    }

    private onSubmit() {
        if (!this.title.value) {
            this.notification.error('The title field is required!')
            return
        }

        if (this.mode === 'bookmark' && !this.url.value) {
            this.notification.error('The bookmark does not have URL!')
            return
        }

        this.submit.disable()
        const url = this.mode === 'bookmark' ? this.url.value : ''
        const parent = parseInt(this.folder.value)

        if (!isNaN(this.editIndex)) {
            // Edit
            ipcRenderer.send(
                IPC_CHANNELS.BOOKMARK,
                RequestHandler.MODIFY,
                {
                    title: this.title.value,
                    url,
                    parent: parent === -1 ? undefined : parent,
                    shortcut: this.shortcut.value,
                } satisfies T_Bookmark,
                this.editIndex,
            )
            return
        }

        // Add
        ipcRenderer.send(IPC_CHANNELS.BOOKMARK, RequestHandler.ADD, {
            title: this.title.value,
            url,
            parent: parent === -1 ? undefined : parent,
            shortcut: this.shortcut.value,
        } satisfies T_Bookmark)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Bookmarks()
})
