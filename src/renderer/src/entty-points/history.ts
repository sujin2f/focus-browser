import { A_Entry } from '@src/renderer/src/entty-points/abs-entry'
/* Utils */
import {
    checkElectron,
    ipcRenderer,
    getSection,
    tagNameIs,
} from '@src/renderer/src/utils'
/* <HTML Fragments /> */
import { H1 } from '@src/renderer/src/fragments/h1'
import { Input } from '@src/renderer/src/fragments/input'
import { BackButton } from '@src/renderer/src/fragments/back-button'
import { ListRow } from '@src/renderer/src/fragments/list-row'
/* CONSTANTS */
import { IPC_CHANNELS, RequestHandler } from '@src/common/constants'
/* T_Types */
import type { Bookmark } from '@src/common/types'

class History extends A_Entry {
    private history: Bookmark[] = []
    private search: Input

    constructor() {
        super()
        this.requestInfo('helpText', 'title', 'url')
        this.requestAnchors()

        // Title
        const h1 = new H1('History 📝').prependTo('title')
        new BackButton().prependTo(h1.element)

        // Search
        this.search = new Input('Search History', 'search')
            .appendTo('search')
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

    private requestAnchors(): void {
        ipcRenderer.send(IPC_CHANNELS.HISTORY, RequestHandler.REQUEST)

        ipcRenderer.once(IPC_CHANNELS.HISTORY, (...args: unknown[]) => {
            const handler = args[0] as RequestHandler
            if (handler !== RequestHandler.RESPONSE) {
                return
            }

            this.history = args[1] as Bookmark[]
            this.renderList()
        })
    }

    private renderList() {
        getSection('list').innerHTML = ''
        this.history.forEach((item, index) => {
            new ListRow(item.title, item.url)
                .prependTo('list')
                .setOnClick(() => {
                    ipcRenderer.send(
                        IPC_CHANNELS.HISTORY,
                        RequestHandler.EXECUTE,
                        index,
                    )
                })
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new History()
})
