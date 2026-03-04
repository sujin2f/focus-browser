import { A_Entry } from '@home/entry-points/abstracts/abs-entry'
/* Utils */
import { checkElectron, getSection, ipcRenderer } from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { Title } from '@home/template-parts/modules/title'
import { H2 } from '@home/template-parts/h2'
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
    BOOKMARK_TYPES,
    EMOJI,
    IPC_CHANNELS,
    MAX_HISTORY,
    REQUEST_HANDLER,
    SEARCH_ENGINES,
} from '@src/common/constants'
/* T_Types */
import type { T_Cleaner_Response, T_Status_Props } from '@src/common/types'
import { Logger } from '@src/common/logger'

const request: (keyof T_Status_Props)[] = [
    'maxHistory',
    'adBlocker',
    'adBlockerStatus',
    'searchEngine',
]

const CARDS: { [key in keyof T_Cleaner_Response]: string } = {
    cacheSize: 'Cache',
    indexedDB: 'Indexed DB',
    anchors: 'Anchors',
    history: 'History',
    popup: 'Blocked Popups',
}
type T_Cards = { [key in keyof T_Cleaner_Response]: Card }

class Settings extends A_Entry {
    private notification: Notification = new Notification().appendTo('root')
    private form: HTMLFormElement = getSection<HTMLFormElement>('form-fields')
    private button?: Button

    private ready = false
    // 🧼 Cleaner Cards
    private cards: T_Cards = {} as T_Cards

    constructor() {
        super()

        // Form
        this.form.addEventListener('submit', this.onSubmit.bind(this))

        // Title
        new Title(`Settings ${EMOJI.SETTINGS}`)

        // Version
        getSection('version').innerHTML = `Version: ${envVersion}`

        // 🧼 Cleaner Title
        new H2(`${EMOJI.CLEANER} Cleaner`).prependTo('cleaner-heading')

        // 🧼 Cleaner Cards
        Object.keys(CARDS).forEach((_key) => {
            const key = _key as keyof T_Cleaner_Response
            this.cards[key] = new Card(CARDS[key])
                .appendTo('grid')
                .setOnClick(() => {
                    if (!this.ready) {
                        return
                    }
                    this.ready = false
                    if (key === 'anchors') {
                        new Loading().appendTo(
                            this.cards['anchors'].description,
                        )
                        this.bookmarkStore.removeAll(
                            BOOKMARK_TYPES.ANCHOR,
                            () => {
                                this.cards['anchors'].description.innerHTML =
                                    '0'
                            },
                        )
                        return
                    }

                    this.cards[key].description.innerHTML = ''
                    new Loading().appendTo(this.cards[key].description)
                    this.requestClean(key)
                })
        })

        this.requestStatus(...request)
        this.requestCleanerSizes()
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

    /**
     * 🧼 Request Cleaner Size
     */
    private requestCleanerSizes(): void {
        this.cards['anchors'].description = '0'
        this.bookmarkStore.getAll(BOOKMARK_TYPES.ANCHOR, (result) => {
            Logger.init().info(result)
            this.cards['anchors'].description = result.length.toString()
        })

        ipcRenderer.send(IPC_CHANNELS.CLEANER, REQUEST_HANDLER.REQUEST, {
            request: '',
        })

        ipcRenderer.once(IPC_CHANNELS.CLEANER, (handler, arg) => {
            if (handler === REQUEST_HANDLER.RESPONSE) {
                const { response } = arg!
                Object.keys(CARDS).forEach((_key) => {
                    const key = _key as keyof T_Cleaner_Response
                    if (key === 'anchors') return
                    this.cards[key].description = response![key]
                })
                this.ready = true
            }
        })
    }

    /**
     * 🧼 Do Clean
     */
    private requestClean(key: keyof typeof CARDS) {
        this.ready = false

        ipcRenderer.send(IPC_CHANNELS.CLEANER, REQUEST_HANDLER.REMOVE, {
            request: key,
        })
        ipcRenderer.once(IPC_CHANNELS.CLEANER, (handler) => {
            if (handler === REQUEST_HANDLER.RESPONSE_SUCCESS) {
                this.cards[key].description = '0'
                this.ready = true
            }

            this.notification.info('Cleaned!')
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
