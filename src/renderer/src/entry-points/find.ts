import { A_Entry } from '@home/entry-points/abstracts/abs-entry'
/* Utils */
import {
    checkElectron,
    getSection,
    ipcRenderer,
    navigate,
} from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { Input } from '@home/template-parts/input'
import { Button } from '@home/template-parts/button'
/* CONSTANTS */
import { IPC_CHANNELS, REQUEST_HANDLER } from '@src/common/constants'

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
                REQUEST_HANDLER.REQUEST,
                input.value,
            )
            navigate({})
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Find()
})
