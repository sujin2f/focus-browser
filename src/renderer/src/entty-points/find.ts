import { A_Entry } from '@src/renderer/src/entty-points/abs-entry'
/* Utils */
import {
    checkElectron,
    getSection,
    ipcRenderer,
    navigate,
} from '@src/renderer/src/utils'
/* <HTML Fragments /> */
import { Input } from '@src/renderer/src/fragments/input'
import { Button } from '@src/renderer/src/fragments/button'
/* CONSTANTS */
import { IPC_CHANNELS, RequestHandler } from '@src/common/constants'

class Find extends A_Entry {
    private form: HTMLFormElement = getSection<HTMLFormElement>('form')

    constructor() {
        super()

        const input = new Input('Find in Page', 'search')
            .prependTo(this.form)
            .focus()
        new Button('Cancel', 'button-hollow').appendTo('button').type = 'reset'
        new Button('Find').appendTo('button').type = 'submit'

        this.form.addEventListener('submit', () => {
            ipcRenderer.send(
                IPC_CHANNELS.FIND,
                RequestHandler.REQUEST,
                input.value,
            )
            navigate()
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Find()
})
