import { A_Entry } from '@home/entry-points/abstracts/abs-entry'
/* Utils */
import { checkElectron, getSection, ipcRenderer, byteToSize } from '@home/utils'
/* <HTML template-part /> */
import { H1 } from '@home/template-parts/h1'
import { H2 } from '@home/template-parts/h2'
import { BackButton } from '@home/template-parts/back-button'
import { Input } from '@home/template-parts/input'
import { Checkbox } from '@home/template-parts/checkbox'
import { Select } from '@home/template-parts/select'
import { Option } from '@home/template-parts/option'
import { Button } from '@home/template-parts/button'
import { Card } from '@home/template-parts/card'
import { Loading } from '@home/template-parts/loading'
import { Notification } from '@home/template-parts/notification'
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

class Settings extends A_Entry {
    private notification: Notification = new Notification().appendTo('root')
    private form: HTMLFormElement = getSection<HTMLFormElement>('form-fields')
    private button?: Button

    private ready = false
    private cache = new Card('Cache').appendTo('grid').setOnClick(() => {
        if (!this.ready) {
            return
        }
        this.ready = false
        new Loading().appendTo(this.cache.description)
        ipcRenderer.send(IPC_CHANNELS.CLEANER, REQUEST_HANDLER.REMOVE, {
            request: 'cacheSize',
        })
    })
    private indexedDB = new Card('IndexedDB')
        .appendTo('grid')
        .setOnClick(() => {
            if (!this.ready) {
                return
            }
            this.ready = false
            new Loading().appendTo(this.indexedDB.description)
            ipcRenderer.send(IPC_CHANNELS.CLEANER, REQUEST_HANDLER.REMOVE, {
                request: 'indexedDB',
            })
        })
    private anchor = new Card('Anchor').appendTo('grid').setOnClick(() => {
        if (!this.ready) {
            return
        }
        this.ready = false
        new Loading().appendTo(this.anchor.description)
        ipcRenderer.send(IPC_CHANNELS.CLEANER, REQUEST_HANDLER.REMOVE, {
            request: 'anchor',
        })
    })
    private history = new Card('History').appendTo('grid').setOnClick(() => {
        if (!this.ready) {
            return
        }
        this.ready = false
        new Loading().appendTo(this.history.description)
        ipcRenderer.send(IPC_CHANNELS.CLEANER, REQUEST_HANDLER.REMOVE, {
            request: 'history',
        })
    })
    private popups = new Card('Blocked Popups')
        .appendTo('grid')
        .setOnClick(() => {
            if (!this.ready) {
                return
            }
            this.ready = false
            new Loading().appendTo(this.popups.description)
            ipcRenderer.send(IPC_CHANNELS.CLEANER, REQUEST_HANDLER.REMOVE, {
                request: 'popups',
            })
        })

    constructor() {
        super()
        this.requestStatus(...request)
        this.requestCleaner()

        // Form
        this.form.addEventListener('submit', this.onSubmit.bind(this))

        // Title
        const h1 = new H1(`Settings ${EMOJI.SETTINGS}`).prependTo('title')
        new BackButton().prependTo(h1.element)
        new H2(`${EMOJI.CLEANER} Cleaner`).prependTo('cleaner-heading')

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

        this.button = new Button('Save Changes').appendTo(
            getSection('form-button'),
        )
        this.button.type = 'submit'
    }

    private requestCleaner(): void {
        ipcRenderer.send(IPC_CHANNELS.CLEANER, REQUEST_HANDLER.REQUEST, {
            request: '',
        })

        ipcRenderer.on(IPC_CHANNELS.CLEANER, (handler, arg) => {
            const { response } = arg!

            if (handler === REQUEST_HANDLER.RESPONSE_SUCCESS) {
                this.notification.info('Cleaned!')
            }

            this.cache.description = byteToSize(response!.cacheSize)
            this.indexedDB.description = byteToSize(response!.indexedDB)
            this.anchor.description = response!.anchors.toString()
            this.history.description = response!.history.toString()
            this.popups.description = response!.popup.toString()
            this.ready = true
        })
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
