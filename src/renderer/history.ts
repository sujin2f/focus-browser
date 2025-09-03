import { IPC_RequestHandler, IPC_Channels, Scenes, I_History } from '@src/types'
import { checkElectron, message } from '@home/util'
import './styles/common.css'

class Controller {
    private histories: I_History = {}

    private get field() {
        return document.getElementById('form-search') as HTMLFormElement
    }
    private get list() {
        return document.getElementById('list') as HTMLDivElement
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
        message.send(IPC_Channels.History, IPC_RequestHandler.Request)
        message.on(
            IPC_Channels.History,
            (handler: IPC_RequestHandler.Response, histories: I_History) => {
                if (handler !== IPC_RequestHandler.Response) {
                    return
                }
                this.histories = histories
                this.renderList()
            },
        )
    }

    private toggleField() {
        this.field.classList.toggle('hidden')

        // if (this.mode === 'add') {
        //     this.title.value = this.browser.title
        //     this.url.value = this.browser.url
        //     this.title.focus()
        // }
    }

    private renderList() {
        this.list.innerHTML = ''

        // this.bookmarks.forEach((bookmark) => {
        //     const row = this.template

        //     const button = row.querySelector('[data-id="title"]')
        //     button.innerHTML = bookmark.title
        //     button.addEventListener('click', () => {
        //         message.send(IPC_Channels.Switch, Scenes.Browser, bookmark.url)
        //     })

        //     this.list.appendChild(row)
        // })
    }
}
new Controller()
