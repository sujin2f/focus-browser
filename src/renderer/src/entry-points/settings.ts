import { A_Entry } from '@src/renderer/src/entry-points/abstracts/abs-entry'
/* Utils */
import { checkElectron, getSection, ipcRenderer } from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { H1 } from '@src/renderer/src/template-parts/h1'
import { BackButton } from '@src/renderer/src/template-parts/back-button'
import { Input } from '@src/renderer/src/template-parts/input'
import { Checkbox } from '@src/renderer/src/template-parts/checkbox'
import { Select } from '@src/renderer/src/template-parts/select'
import { Option } from '@src/renderer/src/template-parts/option'
import { Button } from '@src/renderer/src/template-parts/button'
import { Notification } from '@src/renderer/src/template-parts/notification'
/* CONSTANTS */
import {
    EMOJI,
    IPC_CHANNELS,
    MAX_HISTORY,
    REQUEST_HANDLER,
    SEARCH_ENGINES,
} from '@src/common/constants'
/* T_Types */
import type { T_Status_Props } from '@src/common/types'

const request: (keyof T_Status_Props)[] = [
    'maxHistory',
    'adBlocker',
    'adBlockerStatus',
    'searchEngine',
]

// TODO too dirty
class Settings extends A_Entry {
    private notification: Notification = new Notification().appendTo('root')
    private form: HTMLFormElement = getSection<HTMLFormElement>('form')
    private button?: Button

    constructor() {
        super()
        this.requestStatus(...request)

        // Form
        this.form.addEventListener('submit', this.onSubmit.bind(this))

        // Title
        const h1 = new H1(`Settings ${EMOJI.SETTINGS}`).prependTo('title')
        new BackButton().prependTo(h1.element)

        // Version
        getSection('version').innerHTML = `Version: ${envVersion}`
    }

    protected callbackUpdateStatus() {
        this.form.innerHTML = ''

        // Max History
        const maxHistory = new Input('Maximum History', 'maxHistory').appendTo(
            this.form,
        )
        maxHistory.type = 'number'
        maxHistory.value = this.settings.maxHistory || MAX_HISTORY

        // adBlocker
        const adBlocker = new Checkbox('Use Ad-Blocker', 'adBlocker').appendTo(
            this.form,
        )
        adBlocker.checked = this.settings.adBlocker || false
        if (this.settings.adBlockerStatus === null) {
            const button = document.createElement('button')
            button.addEventListener('click', (e) => {
                e.preventDefault()

                // reload adBlocker
                ipcRenderer.send(IPC_CHANNELS.STATUS, REQUEST_HANDLER.MODIFY, {
                    data: {
                        adBlocker: true,
                    },
                    request,
                })
                ipcRenderer.once(
                    IPC_CHANNELS.STATUS,
                    (handler, status = { data: {} }) => {
                        switch (handler) {
                            case REQUEST_HANDLER.RESPONSE:
                                this.settings = {
                                    ...this.settings,
                                    ...status.data,
                                }
                            // TODO Failed
                        }
                    },
                )
            })
            button.innerHTML =
                'Ad Blocker is failed to load. Click here to reload.'
            button.classList.add('cursor-pointer')
            adBlocker.getHelpText().append(button)
        }
        if (this.settings.adBlockerStatus === false) {
            adBlocker.helpText = 'Ad Blocker is Disabled. '
        }

        // Search Engine
        const searchEngine = new Select(
            'Search Engine',
            'searchEngine',
        ).appendTo(this.form)
        Object.keys(SEARCH_ENGINES).forEach((site) => {
            new Option(
                site,
                site,
                site === this.settings.searchEngine,
            ).appendTo(searchEngine.input)
        })

        this.button = new Button('Save Changes').appendTo(this.form)
        this.button.type = 'submit'
    }

    private onSubmit(e: SubmitEvent) {
        e.preventDefault()

        this.button?.disable()
        const formData = new FormData(this.form)

        const maxHistory = parseInt(
            formData.get('maxHistory')?.toString() || MAX_HISTORY.toString(),
        )
        const adBlocker = !!formData.get('adBlocker')
        const searchEngine = (formData.get('searchEngine')?.toString() ||
            '') as keyof typeof SEARCH_ENGINES

        if (!searchEngine) {
            this.button?.enable()
            this.notification.error('Unknown error has occurred.')
            return
        }

        ipcRenderer.send(IPC_CHANNELS.STATUS, REQUEST_HANDLER.MODIFY, {
            data: {
                maxHistory,
                adBlocker,
                searchEngine,
            },
            request,
        })
        ipcRenderer.once(
            IPC_CHANNELS.STATUS,
            (handler, status = { data: {} }) => {
                switch (handler) {
                    case REQUEST_HANDLER.RESPONSE:
                        this.button?.enable()
                        this.notification.info(
                            'Settings are saved successfully!',
                        )
                        this.settings = { ...this.settings, ...status.data }
                    // TODO Failed
                }
            },
        )
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Settings()
})
