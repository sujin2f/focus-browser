/* Utils */
import { ipcRenderer } from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { Button } from '@home/template-parts/button'
import { Notification } from '@home/template-parts/notification'
import { Modal } from '@home/template-parts/modal'
import { Input } from '@home/template-parts/input'
import { Select } from '@home/template-parts/select'
import { Option } from '@home/template-parts/option'
/* CONSTANTS */
import { IPC_CHANNELS, REQUEST_HANDLER } from '@src/common/constants'
/* T_Types */
import type { T_Bookmark } from '@src/common/types'

export class BookmarkModal extends Modal {
    private bookmark?: T_Bookmark

    public notification: Notification = new Notification().appendTo('root')
    private form = document.createElement('form')
    private title: Input
    private url: Input
    private shortcut: Input
    public folder: Select

    private submit: Button
    private remove: Button

    private isDir = false

    constructor() {
        super()

        this.title = new Input('Title', 'title').appendTo(this.form)
        this.url = new Input('URL', 'url').appendTo(this.form)
        this.shortcut = new Input('Shortcut', 'url').appendTo(this.form)
        this.folder = new Select('Folder', 'folder').appendTo(this.form)

        const formButtons = document.createElement('div')
        formButtons.classList.add('flex', 'justify-between')

        this.form.append(formButtons)

        // Submit Change
        this.submit = new Button('Save Changes').appendTo(formButtons)
        this.submit.type = 'submit'

        // 🗑️ Remove
        this.remove = new Button('🗑️', 'button-clear')
            .appendTo(formButtons)
            .setOnClick(() => {
                if (!this.bookmark || !this.bookmark.id) {
                    return
                }

                ipcRenderer.send(
                    IPC_CHANNELS.BOOKMARK,
                    REQUEST_HANDLER.REMOVE,
                    { item: this.bookmark, meta: this.isDir },
                )
            })

        this.form.addEventListener('submit', (e) => {
            e.preventDefault()
            this.onSubmit()
        })
    }

    protected afterAppend() {
        super.afterAppend()
        this.content.append(this.form)
    }

    open(
        dirs: T_Bookmark[],
        {
            isDir = false,
            bookmark,
        }: {
            isDir?: boolean
            bookmark?: T_Bookmark
        },
    ) {
        this.bookmark = bookmark
        this.isDir = isDir

        this.title.value = bookmark ? bookmark.title : ''
        this.url.value = bookmark ? bookmark.url : ''
        this.shortcut.value = bookmark ? bookmark.shortcut : ''
        this.folder.value = bookmark ? bookmark.shortcut : ''

        if (bookmark?.id) {
            this.remove.show()
        } else {
            this.remove.hide()
        }

        if (isDir) {
            this.folder.hide()
            this.url.hide()
        } else {
            this.folder.show()
            this.url.show()
        }

        this.folder.input.innerHTML = ''
        new Option('== Select Folder ==', '').appendTo(this.folder.input)

        dirs.forEach((dir) => {
            new Option(dir.title, dir.id).appendTo(this.folder.input)
        })

        if (bookmark?.parent) {
            this.folder.value = bookmark?.parent
        }

        super.show()
        this.submit.enable()
        this.remove.enable()
        this.title.focus()
    }

    private onSubmit() {
        if (!this.title.value) {
            this.notification.error('The title field is required!')
            return
        }

        if (!this.isDir && !this.url.value) {
            this.notification.error('The bookmark does not have URL!')
            return
        }

        this.submit.disable()
        this.remove.disable()
        const url = !this.isDir ? this.url.value : ''
        const parent = this.folder.value

        if (this.bookmark?.id) {
            // Edit
            ipcRenderer.send(IPC_CHANNELS.BOOKMARK, REQUEST_HANDLER.MODIFY, {
                item: {
                    id: this.bookmark.id,
                    title: this.title.value,
                    url,
                    parent,
                    shortcut: this.shortcut.value,
                },
                meta: this.isDir,
            })
            return
        }

        // Add
        ipcRenderer.send(IPC_CHANNELS.BOOKMARK, REQUEST_HANDLER.ADD, {
            item: {
                id: '',
                title: this.title.value,
                url,
                parent,
                shortcut: this.shortcut.value,
            },
            meta: this.isDir,
        })
    }
}
