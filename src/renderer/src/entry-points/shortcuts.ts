import { A_Entry } from '@src/renderer/src/entry-points/abstracts/abs-entry'
/* Utils */
import { checkElectron, ipcRenderer, getSection } from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { H1 } from '@src/renderer/src/template-parts/h1'
import { BackButton } from '@src/renderer/src/template-parts/back-button'
import { H2 } from '@src/renderer/src/template-parts/h2'
import { Input } from '@src/renderer/src/template-parts/input'
import { Button } from '@src/renderer/src/template-parts/button'
import { Notification } from '@src/renderer/src/template-parts/notification'
/* CONSTANTS /> */
import { IPC_CHANNELS, REQUEST_HANDLER } from '@src/common/constants'

class Shortcuts extends A_Entry {
    private shortcuts: Record<string, string> = {}

    private form: HTMLFormElement = getSection<HTMLFormElement>('form')
    private button?: Button
    private notification: Notification = new Notification().appendTo('root')

    constructor() {
        super()
        this.handleIPC()
        this.request()

        // Form
        this.form.addEventListener('submit', this.onSubmit.bind(this))

        // Title
        const h1 = new H1('Shortcuts 🏁').prependTo('title')
        new BackButton().prependTo(h1.element)
    }

    private getValue(key: string): string {
        return this.shortcuts[key] || ''
    }
    private createInput(key: string) {
        new Input(key, key).appendTo('form').value = this.getValue(key)
    }

    private render() {
        this.form.innerHTML = ''
        new H2('Edit').appendTo(this.form)
        this.createInput('Add Bookmark')
        this.createInput('Add Anchor')
        this.createInput('Paste Keystroke')
        new H2('Navigate').appendTo(this.form)
        this.createInput('Control Centre')
        this.createInput('Address Bar')
        this.button = new Button('Save Changes').appendTo(this.form)
        this.button.type = 'submit'
    }

    private request(): void {
        ipcRenderer.send(IPC_CHANNELS.SHORTCUTS, REQUEST_HANDLER.REQUEST)
    }

    private handleIPC() {
        ipcRenderer.on(IPC_CHANNELS.SHORTCUTS, (...args: unknown[]) => {
            const handler = args[0] as REQUEST_HANDLER

            switch (handler) {
                case REQUEST_HANDLER.RESPONSE: {
                    this.shortcuts = args[1] as Record<string, string>
                    this.render()
                    return
                }

                case REQUEST_HANDLER.RESULT:
                    this.button?.enable()
                    this.notification.info(
                        'The shortcuts are saved successfully!',
                    )
            }
        })
    }

    private onSubmit(e: SubmitEvent) {
        e.preventDefault()

        this.button?.disable()
        const formData = new FormData(this.form)
        const shortcuts = {
            'Add Bookmark': formData.get('Add Bookmark')?.toString(),
            'Add Anchor': formData.get('Add Anchor')?.toString(),
            'Paste Keystroke': formData.get('Paste Keystroke')?.toString(),
            'Control Centre': formData.get('Control Centre')?.toString(),
            'Address Bar': formData.get('Address Bar')?.toString(),
        }
        ipcRenderer.send(
            IPC_CHANNELS.SHORTCUTS,
            REQUEST_HANDLER.MODIFY,
            shortcuts,
        )
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Shortcuts()
})
