import { A_Entry } from '@src/renderer/src/entty-points/abs-entry'
/* Utils */
import { checkElectron, ipcRenderer } from '@src/renderer/src/utils'
/* <HTML Fragments /> */
import { H1 } from '@src/renderer/src/fragments/h1'
import { Button } from '@src/renderer/src/fragments/button'
/* CONSTANTS */
import { BROWSER, IPC_CHANNELS } from '@src/common/constants'

class Offline extends A_Entry {
    constructor() {
        super()

        // Title
        new H1('No internet 😭').appendTo('title')

        new Button('💫 Refresh')
            .appendTo('form')
            .setOnClick(this.reload.bind(this))
    }

    protected callbackShortcut(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            this.reload()
        }
    }

    private reload() {
        ipcRenderer.send(IPC_CHANNELS.SWITCH, BROWSER, 'reload')
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Offline()
})
