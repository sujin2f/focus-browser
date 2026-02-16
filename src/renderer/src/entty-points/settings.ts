import { A_Entry } from '@src/renderer/src/entty-points/abs-entry'
/* Utils */
import { checkElectron, getSection } from '@src/renderer/src/utils'
/* <HTML Fragments /> */
import { H1 } from '@src/renderer/src/fragments/h1'
import { Input } from '@src/renderer/src/fragments/input'
import { Checkbox } from '@src/renderer/src/fragments/checkbox'
import { BackButton } from '@src/renderer/src/fragments/back-button'
import { Select } from '@src/renderer/src/fragments/select'
import { Button } from '@src/renderer/src/fragments/button'
import { Option } from '@src/renderer/src/fragments/option'
/* CONSTANTS */
import { MAX_HISTORY, SEARCH_ENGINES } from '@src/common/constants'

class Keystrokes extends A_Entry {
    private keystrokes: Record<string, string> = {}

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

        // Title
        const h1 = new H1('Settings ⚙️').prependTo(getSection('title'))
        new BackButton().prependTo(h1.element)

        // Version
        getSection('version').innerHTML = `Version: ${envVersion}`
    }

    protected callbackUpdateInfo() {
        getSection('form').innerHTML = ''

        // const frame = new Checkbox('Show Native Frame').appendTo('form'
        // )
        // frame.helpText =
        //     'Note: This requires restarting the application. You can toggle window fit to screen by pressing ⌘Esc.'
        // frame.checked = this.settings.frame || false

        // const helpText = new Checkbox('Show Help Text').appendTo('orm'
        // )
        // helpText.checked = this.settings.helpText || false

        const maxHistory = new Input('Maximum History', 'maxHistory').appendTo(
            'form',
        )
        maxHistory.type = 'number'
        maxHistory.value = this.settings.maxHistory || MAX_HISTORY

        const adBlocker = new Checkbox('Use Ad-Blocker', 'adBlocker').appendTo(
            'form',
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
        ).appendTo('form')
        Object.keys(SEARCH_ENGINES).forEach((site) => {
            new Option(
                site,
                site,
                site === this.settings.searchEngine,
            ).appendTo(searchEngine.input)
        })

        new Button('Save Changes')
            .appendTo('form')
            .setOnClick(this.save.bind(this))
    }

    private save() {}
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Keystrokes()
})
