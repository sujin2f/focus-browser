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
    public index = NaN
    private bookmark?: T_Bookmark

    public notification: Notification = new Notification().appendTo('root')
    private form = document.createElement('form')
    private title: Input
    private url: Input
    private shortcut: Input
    public folder: Select

    private submit: Button
    private remove: Button

    private get isDir() {
        return !this.bookmark?.url
    }

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

        // Remove
        this.remove = new Button('🗑️', 'button-clear')
            .appendTo(formButtons)
            .setOnClick(() => {
                if (isNaN(this.index)) {
                    return
                }
                if (!this.bookmark) {
                    return
                }
                if (!this.bookmark.id) {
                    return
                }

                ipcRenderer.send(
                    IPC_CHANNELS.BOOKMARK,
                    REQUEST_HANDLER.REMOVE,
                    { bookmark: this.bookmark },
                )
            })

        this.form.addEventListener('submit', (e) => {
            e.preventDefault()
            this.onSubmit()
        })
    }

    protected init() {
        super.init()
        this.content.append(this.form)
    }

    open(
        dirs: T_Bookmark[],
        {
            isDir = false,
            bookmark,
            index = NaN,
        }: {
            isDir?: boolean
            bookmark?: T_Bookmark
            index?: number
        },
    ) {
        this.index = index
        this.bookmark = bookmark

        this.title.value = bookmark ? bookmark.title : ''
        this.url.value = bookmark ? bookmark.url : ''
        this.shortcut.value = bookmark ? bookmark.shortcut : ''
        this.folder.value = bookmark ? bookmark.shortcut : ''

        if (!isNaN(index)) {
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
        new Option('== Select Folder ==', '-1').appendTo(this.folder.input)

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

        if (!isNaN(this.index)) {
            if (!this.bookmark) {
                return
            }
            if (!this.bookmark.id) {
                return
            }

            // Edit
            ipcRenderer.send(IPC_CHANNELS.BOOKMARK, REQUEST_HANDLER.MODIFY, {
                bookmark: {
                    id: this.bookmark.id,
                    title: this.title.value,
                    url,
                    parent,
                    shortcut: this.shortcut.value,
                },
            })
            return
        }

        // Add
        ipcRenderer.send(IPC_CHANNELS.BOOKMARK, REQUEST_HANDLER.ADD, {
            bookmark: {
                id: '',
                title: this.title.value,
                url,
                parent,
                shortcut: this.shortcut.value,
            },
        })
    }
}
