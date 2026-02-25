import { A_Entry } from '@home/entry-points/abstracts/abs-entry'
/* Utils */
import { checkElectron, ipcRenderer, getSection } from '@home/utils'
/* <HTML template-part /> */
import { H1 } from '@home/template-parts/h1'
import { BackButton } from '@home/template-parts/back-button'
import { Select } from '@home/template-parts/select'
import { Option } from '@home/template-parts/option'
import { Input } from '@home/template-parts/input'
import { Button } from '@home/template-parts/button'
import { Notification } from '@home/template-parts/notification'
/* CONSTANTS */
import {
    EMOJI,
    IPC_CHANNELS,
    Menu,
    REQUEST_HANDLER,
} from '@src/common/constants'

class Keystrokes extends A_Entry {
    private keystrokes: Record<string, string> = {}

    private form: HTMLFormElement = getSection<HTMLFormElement>('form')
    private select: Select
    private input: Input
    private button: Button
    private notification: Notification = new Notification().appendTo('root')

    constructor() {
        super()
        this.requestStatus('url')
        this.request()

        // Title
        const h1 = new H1(
            `Keystrokes ${EMOJI[Menu.PASTE_KEYSTROKE]}`,
        ).prependTo('title')
        new BackButton().prependTo(h1.element)

        // Form
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

    private request(): void {
        ipcRenderer.send(IPC_CHANNELS.KEYSTROKES, REQUEST_HANDLER.REQUEST)
        ipcRenderer.on(IPC_CHANNELS.KEYSTROKES, (handler, keystrokes = {}) => {
            switch (handler) {
                case REQUEST_HANDLER.RESPONSE: {
                    this.keystrokes = {}
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

                case REQUEST_HANDLER.RESPONSE_SUCCESS:
                    this.button.enable()
                    this.notification.info(
                        'The keystroke is saved successfully!',
                    )

                // TODO Failed
            }
        })
    }

    private onSubmit(e: SubmitEvent) {
        e.preventDefault()

        this.button.disable()

        const formData = new FormData(this.form)
        const host = formData.get('hosts')?.toString()
        const value = formData.get('value')?.toString()

        if (!host) {
            this.button.enable()
            this.notification.error('Please select the Host.')
            return
        }

        ipcRenderer.send(IPC_CHANNELS.KEYSTROKES, REQUEST_HANDLER.MODIFY, {
            [host]: value || '',
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Keystrokes()
})
