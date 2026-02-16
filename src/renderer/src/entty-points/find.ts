import { A_Entry } from '@src/renderer/src/entty-points/abs-entry'
/* Utils */
import { checkElectron, ipcRenderer, navigate } from '@src/renderer/src/utils'
/* <HTML Fragments /> */
import { Input } from '@src/renderer/src/fragments/input'
import { Button } from '@src/renderer/src/fragments/button'
/* CONSTANTS */
import { IPC_CHANNELS, RequestHandler } from '@src/common/constants'

class Find extends A_Entry {
    constructor() {
        super()

        new Input('Find in Page', 'search')
            .prependTo('form')
            .setOnEnter((e) => {
                if (e.code === 'Enter') {
                    ipcRenderer.send(
                        IPC_CHANNELS.FIND,
                        RequestHandler.REQUEST,
                        (e.target as HTMLInputElement).value,
                    )
                    navigate()
                }
            })
            .focus()
        new Button('Cancel').appendTo('button')
        new Button('Find').appendTo('button')
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Find()
})
