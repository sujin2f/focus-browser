/* <HTML template-part /> */
import { Button } from '@home/template-parts/button'
import { Notification } from '@home/template-parts/notification'
import { Modal } from '@home/template-parts/modal'
import { Input } from '@home/template-parts/input'
import { Select } from '@home/template-parts/select'
import { Option } from '@home/template-parts/option'
/* T_Types */
import type { T_Bookmark } from '@src/common/types/store'
/* Models */
import { Bookmark } from '@home/utils/indexedDB/bookmark'

export class BookmarkModal extends Modal {
    private bookmark?: T_Bookmark

    public notification: Notification = new Notification().appendTo('root')
    private form = document.createElement('form')
    private title: Input
    private url: Input
    private shortcut: Input
    public folder: Select

    private submit: Button

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

        this.form.addEventListener('submit', (e) => {
            e.preventDefault()
            this.onSubmit()
        })
    }

    protected afterAppend() {
        super.afterAppend()
        this.content.append(this.form)
    }

    open(dirs: T_Bookmark[], bookmark?: T_Bookmark) {
        this.bookmark = bookmark
        this.isDir = Boolean(bookmark?.dir)

        this.title.value = bookmark ? bookmark.title : ''
        this.url.value = bookmark ? bookmark.url : ''
        this.shortcut.value = bookmark ? bookmark.shortcut : ''
        this.folder.value = bookmark ? bookmark.shortcut : ''

        if (this.isDir) {
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
        const url = !this.isDir ? this.url.value : ''
        const parent = this.folder.value

        if (this.bookmark?.uid) {
            // Edit
            const store = new Bookmark()
            store.ready(() =>
                store.update(
                    {
                        ...this.bookmark!,
                        title: this.title.value,
                        url,
                        parent,
                        shortcut: this.shortcut.value,
                    },
                    () => window.location.reload(),
                ),
            )
            return
        }

        // Add
        const store = new Bookmark()
        store.ready(() =>
            store.add(
                {
                    title: this.title.value,
                    url,
                    parent,
                    shortcut: this.shortcut.value,
                },
                () => window.location.reload(),
            ),
        )
    }
}
