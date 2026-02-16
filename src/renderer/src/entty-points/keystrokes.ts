import { A_Entry } from '@src/renderer/src/entty-points/abs-entry'
/* Utils */
import { checkElectron, ipcRenderer, getSection } from '@src/renderer/src/utils'
/* <HTML Fragments /> */
import { H1 } from '@src/renderer/src/fragments/h1'
import { BackButton } from '@src/renderer/src/fragments/back-button'
import { Select } from '@src/renderer/src/fragments/select'
import { Option } from '@src/renderer/src/fragments/option'
import { Input } from '@src/renderer/src/fragments/input'
import { Button } from '@src/renderer/src/fragments/button'
import { Notification } from '@src/renderer/src/fragments/notification'
/* CONSTANTS */
import { IPC_CHANNELS, RequestHandler } from '@src/common/constants'

class Keystrokes extends A_Entry {
    private keystrokes: Record<string, string> = {}

    private form: HTMLFormElement
    private select: Select
    private input: Input
    private button: Button
    private notification: Notification = new Notification().appendTo('root')

    constructor() {
        super()
        this.handleIPC()
        this.requestInfo('url')
        this.request()

        // Title
        const h1 = new H1('Keystrokes 🎹').prependTo('title')
        new BackButton().prependTo(h1.element)

        // Form
        this.form = getSection<HTMLFormElement>('form')
        this.form.addEventListener('submit', this.onSubmit.bind(this))

        // Host
        this.select = new Select('Hosts', 'hosts')
            .appendTo(this.form)
            .setOnChange(() => {
                this.input.value = this.keystrokes[this.select.value] || ''
            })

        // Value
        this.input = new Input('Keystroke', 'value').appendTo(this.form)
        this.input.helpText =
            'Type [Tab], [Space], and [Enter] for those keystrokes.'

        // Button
        this.button = new Button('Save Changes').appendTo(this.form)
        this.button.type = 'submit'
    }

    private request(): void {
        ipcRenderer.send(IPC_CHANNELS.KEYSTROKES, RequestHandler.REQUEST)
    }

    private render() {
        new Option('== Select Host ==', '').appendTo(this.select.input)

        Object.keys(this.keystrokes).forEach((host, index) => {
            const value = this.keystrokes[host]
            new Option(host, host, index === 0).appendTo(this.select.input)

            if (index === 0) {
                this.input.value = value
            }
        })
    }

    private handleIPC() {
        ipcRenderer.on(IPC_CHANNELS.KEYSTROKES, (...args: unknown[]) => {
            const handler = args[0] as RequestHandler

            switch (handler) {
                case RequestHandler.RESPONSE: {
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
                    this.render()
                    this.select.focus()
                    return
                }

                case RequestHandler.RESULT:
                    this.button.enable()
                    this.notification.show(
                        'The keystroke is saved successfully!',
                    )
            }
        })
    }

    private onSubmit(e: SubmitEvent) {
        e.preventDefault()

        this.button.disable()

        const target = e.target as HTMLFormElement
        const formData = new FormData(target)
        const host = formData.get('hosts')?.toString()
        const value = formData.get('value')?.toString()

        if (!host) {
            this.button.enable()
            this.notification.error('Please select the Host.')
            return
        }

        ipcRenderer.send(IPC_CHANNELS.KEYSTROKES, RequestHandler.MODIFY, {
            [host]: value,
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Keystrokes()
})
