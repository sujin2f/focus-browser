import { A_Entry } from '@src/renderer/src/entty-points/abs-entry'
/* Utils */
import { checkElectron, getSection, ipcRenderer } from '@src/renderer/src/utils'
/* <HTML Fragments /> */
import { H1 } from '@src/renderer/src/fragments/h1'
import { BackButton } from '@src/renderer/src/fragments/back-button'
import { Input } from '@src/renderer/src/fragments/input'
import { Checkbox } from '@src/renderer/src/fragments/checkbox'
import { Select } from '@src/renderer/src/fragments/select'
import { Option } from '@src/renderer/src/fragments/option'
import { Button } from '@src/renderer/src/fragments/button'
import { Notification } from '@src/renderer/src/fragments/notification'
/* CONSTANTS */
import {
    IPC_CHANNELS,
    MAX_HISTORY,
    RequestHandler,
    SEARCH_ENGINES,
} from '@src/common/constants'
/* T_Type */
import type { Info } from '@src/common/types'

class Settings extends A_Entry {
    private notification: Notification = new Notification().appendTo('root')
    private form: HTMLFormElement = getSection<HTMLFormElement>('form')
    private button?: Button

    constructor() {
        super()
        this.requestInfo(
            'helpText',
            'maxHistory',
            'adBlocker',
            'adBlockerStatus',
            'cacheSize',
            'searchEngine',
            'frame',
        )

        // Form
        this.form.addEventListener('submit', this.onSubmit.bind(this))

        // Title
        const h1 = new H1('Settings ⚙️').prependTo(getSection('title'))
        new BackButton().prependTo(h1.element)

        // Version
        getSection('version').innerHTML = `Version: ${envVersion}`
    }

    protected callbackUpdateInfo() {
        this.form.innerHTML = ''

        // const frame = new Checkbox('Show Native Frame').appendTo('form'
        // )
        // frame.helpText =
        //     'Note: This requires restarting the application. You can toggle window fit to screen by pressing ⌘Esc.'
        // frame.checked = this.settings.frame || false

        // const helpText = new Checkbox('Show Help Text').appendTo('orm'
        // )
        // helpText.checked = this.settings.helpText || false

        const maxHistory = new Input('Maximum History', 'maxHistory').appendTo(
            this.form,
        )
        maxHistory.type = 'number'
        maxHistory.value = this.settings.maxHistory || MAX_HISTORY

        const adBlocker = new Checkbox('Use Ad-Blocker', 'adBlocker').appendTo(
            this.form,
        )
        adBlocker.checked = this.settings.adBlocker || false
        if (this.settings.adBlockerStatus === null) {
            adBlocker.helpText = 'Ad Blocker is failed to load.'
        }
        if (this.settings.adBlockerStatus === false) {
            adBlocker.helpText = 'Ad Blocker is Disabled.'
        }

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
        console.log('onSubmit')
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

        ipcRenderer.send(IPC_CHANNELS.INFO, RequestHandler.MODIFY, {
            maxHistory,
            adBlocker,
            searchEngine,
        } satisfies Partial<Info>)

        ipcRenderer.once(IPC_CHANNELS.INFO, (...args: unknown[]) => {
            const handler = args[0] as RequestHandler

            if (handler !== RequestHandler.RESULT) {
                return
            }

            this.button?.enable()
            this.notification.show('Settings are saved successfully!')
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Settings()
})
