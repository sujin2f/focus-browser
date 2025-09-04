import type { NavigationEntry } from 'electron'
import { IPC_RequestHandler, IPC_Channels, Scenes } from '@src/types'
import { checkElectron, message } from '@home/util'
import './styles/common.css'

class Controller {
    private history: NavigationEntry[]

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
            (
                handler: IPC_RequestHandler.Response,
                history: NavigationEntry[],
            ) => {
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

        const length = this.history.length
        this.history.reverse().forEach((item, index) => {
            const row = this.template
            const title = row.querySelector('[data-id="title"]')
            title.innerHTML = item.title
            title.addEventListener('click', () => {
                message.send(
                    IPC_Channels.History,
                    IPC_RequestHandler.Execute,
                    length - index - 1,
                )
            })

            this.tbody.appendChild(row)
        })
    }
}
new Controller()
