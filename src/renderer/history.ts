import { IPC_RequestHandler, IPC_Channels, Scenes, I_History } from '@src/types'
import { checkElectron, message } from '@home/util'
import './styles/common.css'

class Controller {
    private history: I_History = {}

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
        this.initICP()
    }

    private onShortcut(e: KeyboardEvent) {
        switch (e.key) {
            case 'Escape':
                message.send(IPC_Channels.Switch, Scenes.Browser)
                break
        }
    }

    private initICP() {
        message.send(IPC_Channels.History, IPC_RequestHandler.Request)
        message.on(
            IPC_Channels.History,
            (handler: IPC_RequestHandler.Response, history: I_History) => {
                if (handler !== IPC_RequestHandler.Response) {
                    return
                }
                this.history = history
                this.renderList()
            },
        )
    }

    private renderList() {
        this.tbody.innerHTML = ''

        Object.keys(this.history)
            .sort()
            .forEach((timestamp) => {
                const item = this.history[timestamp]
                const row = this.template
                const title = row.querySelector('[data-id="title"]')
                title.innerHTML = item.title
                title.addEventListener('click', () => {
                    message.send(IPC_Channels.Switch, Scenes.Browser, item.url)
                })

                const time = row.querySelector('[data-id="time"]')
                time.innerHTML = new Date(parseInt(timestamp)).toLocaleString()

                this.tbody.appendChild(row)
            })
    }
}
new Controller()
