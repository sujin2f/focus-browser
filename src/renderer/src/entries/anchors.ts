import { A_Entry } from '@src/renderer/src/entries/abs-entry'
/* Utils */
import {
    checkElectron,
    ipcRenderer,
    navigate,
    tagNameIs,
} from '@src/renderer/src/utils'
/* <HTML Fragments /> */
import { H1 } from '@src/renderer/src/fragments/h1'
import { Input } from '@src/renderer/src/fragments/input'
import { BackButton } from '@src/renderer/src/fragments/back-button'
import { ListRow } from '@src/renderer/src/fragments/list-row'
/* CONSTANTS */
import { Channel, RequestHandler } from '@src/common/constants'
/* T_Types */
import type { Bookmark } from '@src/common/types'

class Anchors extends A_Entry {
    private anchors: Bookmark[] = []
    private search: Input

    constructor() {
        super()
        this.requestInfo('helpText', 'title', 'url')
        this.requestAnchors()

        // Title
        const h1 = new H1('Anchors').prepend(this.getSection('section-title'))
        new BackButton().prepend(h1.element)

        // Search
        this.search = new Input('Search Anchor')
        this.search.append(this.getSection('section-search'))
        this.search.input.addEventListener('input', () => {
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
        this.search.input.value = ''
        this.search.input.focus()
    }

    private requestAnchors(): void {
        ipcRenderer.send(Channel.ANCHOR, RequestHandler.REQUEST)

        ipcRenderer.once(Channel.ANCHOR, (...args: unknown[]) => {
            const handler = args[0] as RequestHandler
            if (handler !== RequestHandler.RESPONSE) {
                return
            }

            this.anchors = args[1] as Bookmark[]
            this.renderList()
        })
    }

    private renderList() {
        this.getSection('section-list').innerHTML = ''
        this.anchors.forEach((anchor) => {
            new ListRow(anchor.title, anchor.url)
                .append(this.getSection('section-list'))
                .setOnClick(() => {
                    navigate(anchor.url, RequestHandler.REMOVE)
                })
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Anchors()
})
