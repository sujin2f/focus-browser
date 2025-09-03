import { Bookmark, IPC_RequestHandler, IPC_Channels, Scenes } from '@src/types'
import { checkElectron, message } from '@home/util'
import './styles/common.css'

class Controller {
    private browser: Bookmark = {
        title: '',
        url: '',
    }
    private bookmarks: Bookmark[] = []

    private get field() {
        return document.getElementById('form-add') as HTMLFormElement
    }
    private get title() {
        return document.getElementById('bookmark-title') as HTMLInputElement
    }
    private get url() {
        return document.getElementById('bookmark-url') as HTMLInputElement
    }
    private get list() {
        return document.getElementById('list') as HTMLDivElement
    }
    private get template() {
        const template = document.getElementById('row') as HTMLTemplateElement
        return template.content.cloneNode(true) as HTMLElement
    }
    private get mode() {
        return !this.field.classList.contains('hidden') ? 'add' : 'list'
    }

    constructor() {
        document.addEventListener('DOMContentLoaded', () => this.init())
    }

    init() {
        checkElectron()
        document.addEventListener('keydown', (e) => this.onShortcut(e))
        this.field.addEventListener('submit', (e) => this.onSubmit(e))

        this.initICP()
    }

    private onShortcut(e: KeyboardEvent) {
        switch (e.key) {
            case 'Escape':
                message.send(IPC_Channels.Switch, Scenes.Browser)
                break
            case 'D':
            case 'd':
                const target = e.target as HTMLElement
                if (target.tagName.toLowerCase() === 'input') {
                    return
                }
                e.preventDefault()
                this.toggleField()
                break
        }
    }

    private initICP() {
        message.send(IPC_Channels.Bookmarks, IPC_RequestHandler.Request)
        message.on(
            IPC_Channels.Bookmarks,
            (
                handler: IPC_RequestHandler.Response,
                location: Bookmark,
                bookmarks: Bookmark[],
            ) => {
                if (handler !== IPC_RequestHandler.Response) {
                    return
                }
                this.browser = location
                this.bookmarks = []
                this.bookmarks.push(...bookmarks)
                this.renderList()
            },
        )
    }

    private toggleField() {
        this.field.classList.toggle('hidden')

        if (this.mode === 'add') {
            this.title.value = this.browser.title
            this.url.value = this.browser.url
            this.title.focus()
        }
    }

    private renderList() {
        this.list.innerHTML = ''

        this.bookmarks.forEach((bookmark) => {
            const row = this.template

            const button = row.querySelector('[data-id="title"]')
            button.innerHTML = bookmark.title
            button.addEventListener('click', () => {
                message.send(IPC_Channels.Switch, Scenes.Browser, bookmark.url)
            })

            this.list.appendChild(row)
        })
    }

    private onSubmit(e: SubmitEvent) {
        e.preventDefault()
        const title = this.title.value
        const url = this.url.value

        if (!title || !url) {
            return
        }

        message.send(IPC_Channels.Bookmarks, IPC_RequestHandler.Add, {
            title,
            url,
        })
    }
}
new Controller()
