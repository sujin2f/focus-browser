import { A_Entry } from '@src/renderer/src/entty-points/abs-entry'
/* Utils */
import { checkElectron, ipcRenderer, getSection } from '@src/renderer/src/utils'
/* <HTML Fragments /> */
import { H1 } from '@src/renderer/src/fragments/h1'
import { H2 } from '@src/renderer/src/fragments/h2'
import { BackButton } from '@src/renderer/src/fragments/back-button'
import { Input } from '@src/renderer/src/fragments/input'
import { Button } from '@src/renderer/src/fragments/button'
/* CONSTANTS /> */
import { IPC_CHANNELS, RequestHandler } from '@src/common/constants'

class Shortcuts extends A_Entry {
    private shortcuts: Record<string, string> = {}

    constructor() {
        super()
        this.request()

        // Title
        const h1 = new H1('Shortcuts 🏁').prependTo('title')
        new BackButton().prependTo(h1.element)
    }

    private request(): void {
        ipcRenderer.send(IPC_CHANNELS.SHORTCUTS, RequestHandler.REQUEST)

        ipcRenderer.once(IPC_CHANNELS.SHORTCUTS, (...args: unknown[]) => {
            const handler = args[0] as RequestHandler
            if (handler !== RequestHandler.RESPONSE) {
                return
            }

            this.shortcuts = args[1] as Record<string, string>
            this.render()
        })
    }

    private getValue(key: string): string {
        return this.shortcuts[key] || ''
    }
    private createInput(key: string) {
        new Input(key, key).appendTo('form').value = this.getValue(key)
    }

    private render() {
        const section = getSection('form')
        section.innerHTML = ''
        new H2('Edit').appendTo(section)
        this.createInput('Add Bookmark')
        this.createInput('Add Anchor')
        new H2('Navigate').appendTo(section)
        this.createInput('Control Centre')
        this.createInput('Address Bar')
        new Button('Save Changes').appendTo(section)
    }

    private save() {}
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Shortcuts()
})
