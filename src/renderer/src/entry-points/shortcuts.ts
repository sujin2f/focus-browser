import { A_Entry } from '@src/renderer/src/entry-points/abstracts/abs-entry'
/* Utils */
import {
    checkElectron,
    ipcRenderer,
    getSection,
    navigate,
} from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { H1 } from '@src/renderer/src/template-parts/h1'
import { BackButton } from '@src/renderer/src/template-parts/back-button'
import { H2 } from '@src/renderer/src/template-parts/h2'
import { Input } from '@src/renderer/src/template-parts/input'
import { Button } from '@src/renderer/src/template-parts/button'
import { Notification } from '@src/renderer/src/template-parts/notification'
/* CONSTANTS */
import {
    BROWSER,
    EMOJI,
    IPC_CHANNELS,
    Menu,
    MenuCategory,
    REQUEST_HANDLER,
    EDITABLE_SHORTCUTS,
} from '@src/common/constants'
/* T_Types */
import type { T_Shortcut_Store } from '@src/common/types'

class Shortcuts extends A_Entry {
    private shortcuts: T_Shortcut_Store = {}

    private form: HTMLFormElement = getSection<HTMLFormElement>('form')
    private button?: Button
    private notification: Notification = new Notification().appendTo('root')

    constructor() {
        super()
        this.request()

        // Form
        this.form.addEventListener('submit', this.onSubmit.bind(this))

        // Title
        const h1 = new H1(`Shortcuts ${EMOJI.SHORTCUTS}`).prependTo('title')
        new BackButton().prependTo(h1.element)

        document
            .getElementById('link--electron-shortcuts')!
            .addEventListener('click', () => {
                navigate({
                    scene: BROWSER,
                    address:
                        'https://www.electronjs.org/docs/latest/tutorial/keyboard-shortcuts',
                })
            })
    }

    private getValue(key: Menu): string {
        return this.shortcuts[key] || ''
    }

    private render() {
        this.form.innerHTML = ''

        Object.keys(EDITABLE_SHORTCUTS).forEach((parent) => {
            new H2(parent).appendTo(this.form).addClass('h2--shortcuts')
            EDITABLE_SHORTCUTS[parent as MenuCategory]!.forEach((menu) => {
                const label = `${EMOJI[menu] ? `${EMOJI[menu]} ` : ''}${menu}`
                new Input(label, menu).appendTo('form').value =
                    this.getValue(menu)
            })
        })

        this.button = new Button('Save Changes')
            .appendTo(this.form)
            .addClass('h2--shortcuts')
        this.button.type = 'submit'
    }

    private request(): void {
        ipcRenderer.send(IPC_CHANNELS.SHORTCUTS, REQUEST_HANDLER.REQUEST)
        ipcRenderer.on(IPC_CHANNELS.SHORTCUTS, (handler, shortcuts = {}) => {
            switch (handler) {
                case REQUEST_HANDLER.RESPONSE: {
                    this.shortcuts = shortcuts
                    this.render()
                    return
                }

                case REQUEST_HANDLER.RESPONSE_SUCCESS:
                    this.button?.enable()
                    this.notification.info(
                        'The shortcuts are saved successfully!',
                    )
                // TODO Failed
            }
        })
    }

    private onSubmit(e: SubmitEvent) {
        e.preventDefault()

        this.button?.disable()
        const formData = new FormData(this.form)
        const shortcuts: Record<string, string> = {}

        Object.keys(EDITABLE_SHORTCUTS).forEach((parent) => {
            EDITABLE_SHORTCUTS[parent as MenuCategory]!.forEach((menu) => {
                shortcuts[menu] = formData.get(menu)?.toString() || ''
            })
        })

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
