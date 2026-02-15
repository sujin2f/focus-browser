import { A_Entry } from '@src/renderer/src/entries/abs-entry'
/* Utils */
import { checkElectron, ipcRenderer } from '@src/renderer/src/utils'
/* <HTML Fragments /> */
import { H1 } from '@src/renderer/src/fragments/h1'
import { Input } from '@src/renderer/src/fragments/input'
import { BackButton } from '@src/renderer/src/fragments/back-button'
import { Select } from '@src/renderer/src/fragments/select'
import { Button } from '@src/renderer/src/fragments/button'
import { Option } from '@src/renderer/src/fragments/option'
/* CONSTANTS */
import { IPC_CHANNELS, RequestHandler } from '@src/common/constants'

class Keystrokes extends A_Entry {
    private keystrokes: Record<string, string> = {}
    private select: Select
    private input: Input
    private button: Button

    constructor() {
        super()
        this.requestInfo('helpText', 'title', 'url')
        this.requestKeystrokes()

        // Title
        const h1 = new H1('Keystrokes 🎹').prepend(
            this.getSection('section-title'),
        )
        new BackButton().prepend(h1.element)

        // Host
        this.select = new Select('Hosts')
            .append(this.getSection('section-form'))
            .setOnChange(() => {
                this.input.value = this.keystrokes[this.select.value] || ''
            })

        this.input = new Input('Keystroke').append(
            this.getSection('section-form'),
        )
        this.input.helpText =
            'Type [Tab], [Space], and [Enter] for those keystrokes.'
        this.button = new Button('Save Changes')
            .append(this.getSection('section-form'))
            .setOnClick(this.save.bind(this))
    }

    private requestKeystrokes(): void {
        ipcRenderer.send(IPC_CHANNELS.KEYSTROKES, RequestHandler.REQUEST)

        ipcRenderer.once(IPC_CHANNELS.KEYSTROKES, (...args: unknown[]) => {
            const handler = args[0] as RequestHandler
            if (handler !== RequestHandler.RESPONSE) {
                return
            }

            this.keystrokes = {}
            const keystrokes = args[1] as Record<string, string>
            const url = this.settings.url
            if (url) {
                const host = new URL(url).host
                this.keystrokes[host] = ''
            }
            Object.keys(keystrokes).forEach((host) => {
                this.keystrokes[host] = keystrokes[host]
            })
            this.renderForm()
            this.select.focus()
        })
    }

    private renderForm() {
        Object.keys(this.keystrokes).forEach((host, index) => {
            const value = this.keystrokes[host]
            new Option(host, host, index === 0).append(this.select.input)

            if (index === 0) {
                this.input.value = value
            }
        })
    }

    private save() {
        const host = this.select.value
        const value = this.input.value
        ipcRenderer.send(IPC_CHANNELS.KEYSTROKES, RequestHandler.MODIFY, {
            [host]: value,
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Keystrokes()
})
