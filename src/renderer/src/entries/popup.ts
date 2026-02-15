import { A_Entry } from '@src/renderer/src/entries/abs-entry'
/* Utils */
import { checkElectron, ipcRenderer, tagNameIs } from '@src/renderer/src/utils'
/* <HTML Fragments /> */
import { H1 } from '@src/renderer/src/fragments/h1'
import { Input } from '@src/renderer/src/fragments/input'
import { BackButton } from '@src/renderer/src/fragments/back-button'
import { ListRow } from '@src/renderer/src/fragments/list-row'
/* CONSTANTS */
import { Channel, RequestHandler } from '@src/common/constants'
/* T_Types */
import type { PopupBlocker } from '@src/common/types'

class Popup extends A_Entry {
    private popups: PopupBlocker[] = []
    private search: Input

    constructor() {
        super()
        this.requestInfo('helpText', 'title', 'url')
        this.requestPopupBlockers()

        // Title
        const h1 = new H1('Popup Blocker').prepend(
            this.getSection('section-title'),
        )
        new BackButton().prepend(h1.element)

        // Search
        this.search = new Input('Search Popup Blocker')
            .append(this.getSection('section-search'))
            .setOnInput(() => {
                // TODO search
            })
    }

    protected callbackShortcut(e: KeyboardEvent) {
        if (tagNameIs(document.activeElement, 'input')) {
            return
        }

        if (e.key.length !== 1) {
            return
        }

        if (e.altKey || e.ctrlKey || e.metaKey) {
            return
        }

        // Focus Search
        this.search.value = ''
        this.search.focus()
    }

    private requestPopupBlockers(): void {
        ipcRenderer.send(Channel.POPUP_BLOCKER, RequestHandler.REQUEST)

        ipcRenderer.once(Channel.POPUP_BLOCKER, (...args: unknown[]) => {
            const handler = args[0] as RequestHandler
            if (handler !== RequestHandler.RESPONSE) {
                return
            }

            const blocked = args[1] as string[]
            const allowed = args[2] as string[]

            allowed.forEach((host) => this.popups.push({ host, allowed: true }))
            blocked.forEach((host) =>
                this.popups.push({ host, allowed: false }),
            )
            this.renderList()
        })
    }

    private renderList() {
        this.getSection('section-list').innerHTML = ''
        this.popups.forEach((item) => {
            new ListRow(item.host)
                .append(this.getSection('section-list'))
                .setOnClick(() => {
                    // TODO
                })
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Popup()
})
