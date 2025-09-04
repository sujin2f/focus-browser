import { Bookmark, IPC_RequestHandler, IPC_Channels, Scenes } from '@src/types'
import { checkElectron, message } from '@home/util'
import './styles/common.css'

class Controller {
    private browser: Bookmark = {
        title: '',
        url: '',
    }
    private bookmarks: Bookmark[] = []

    private get toggle() {
        return document.getElementById('form__toggle') as HTMLButtonElement
    }
    private get form() {
        return document.getElementById('form') as HTMLFormElement
    }
    private get title() {
        return document.getElementById('form__title') as HTMLInputElement
    }
    private get url() {
        return document.getElementById('form__url') as HTMLInputElement
    }
    private get tbody() {
        return document.getElementById('tbody') as HTMLTableSectionElement
    }
    private get template() {
        const template = document.getElementById('row') as HTMLTemplateElement
        return template.content.cloneNode(true) as HTMLElement
    }

    constructor() {
        document.addEventListener('DOMContentLoaded', () => this.init())
    }

    init() {
        checkElectron()
        document.addEventListener('keydown', (e) => this.onShortcut(e))
        this.form.addEventListener('submit', (e) => this.onSubmit(e))
        this.toggle.addEventListener('click', () => this.toggleForm())

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
                this.toggleForm()
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

    private toggleForm() {
        this.form.classList.toggle('hidden')
        this.toggle.classList.toggle('hidden')

        if (!this.form.classList.contains('hidden')) {
            this.title.value = this.browser.title
            this.url.value = this.browser.url
            this.title.focus()
        }
    }

    private renderList() {
        this.tbody.innerHTML = ''

        this.bookmarks.forEach((bookmark, index) => {
            const row = this.template

            const title = row.querySelector('[data-id="title"]')
            title.innerHTML = bookmark.title
            title.addEventListener('click', () => {
                message.send(IPC_Channels.Switch, Scenes.Browser, bookmark.url)
            })

            const shortcut = row.querySelector('[data-id="shortcut"]')
            shortcut.innerHTML = bookmark.shortcut || ''

            const tr = row.querySelector('tr')
            tr.dataset.index = index.toString()

            this.tbody.appendChild(row)
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
