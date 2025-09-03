import { IPC_Channels, Scenes } from '@src/types'
import { checkElectron, message } from '@home/util'
import './styles/common.css'

enum Elements {
    Address = 'address-bar',
}

class Controller {
    private get addressBar() {
        return document.getElementById(Elements.Address) as HTMLInputElement
    }
    constructor() {
        document.addEventListener('DOMContentLoaded', () => this.init())
    }

    init() {
        checkElectron()

        document.addEventListener('keydown', (e) => this.onShortcut(e.key))
        this.addressBar.addEventListener('keydown', (e) => this.onEnter(e))

        const url = new URL(window.location.toString())
        const location = url.searchParams.get('location')

        if (location) {
            this.addressBar.focus()
        }
    }

    private onEnter(ev: KeyboardEvent) {
        if (ev.key !== 'Enter') {
            return
        }

        if (!this.addressBar.value) {
            return
        }

        message.send(IPC_Channels.Switch, Scenes.Browser, this.addressBar.value)
    }

    private onShortcut(key: string) {
        switch (key) {
            case 'Escape':
                message.send(IPC_Channels.Switch, Scenes.Browser)
                break
            case 'B':
            case 'b':
                location.href = '/bookmarks.html'
                break
            case 'h':
            case 'H':
                location.href = '/history.html'
                break
        }
    }
}
new Controller()
