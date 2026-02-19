import { A_Entry } from '@src/renderer/src/entry-points/abstracts/abs-entry'
/* Utils */
import { checkElectron, ipcRenderer } from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { H1 } from '@src/renderer/src/template-parts/h1'
import { Button } from '@src/renderer/src/template-parts/button'
/* CONSTANTS */
import { BROWSER, IPC_CHANNELS, REQUEST_HANDLER } from '@src/common/constants'
import { T_IPC_Switch } from '@src/common/types'

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
        } satisfies T_IPC_Switch)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Offline()
})
