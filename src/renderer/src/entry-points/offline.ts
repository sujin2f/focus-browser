import { A_Entry } from '@home/entry-points/abstracts/abs-entry'
/* Utils */
import { checkElectron, ipcRenderer } from '@home/utils'
/* <HTML template-part /> */
import { H1 } from '@home/template-parts/h1'
import { Button } from '@home/template-parts/button'
/* CONSTANTS */
import { BROWSER, IPC_CHANNELS, REQUEST_HANDLER } from '@src/common/constants'

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
        ipcRenderer.send(IPC_CHANNELS.SWITCH, REQUEST_HANDLER.EXECUTE, {
            reloading: true,
            scene: BROWSER,
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Offline()
})
