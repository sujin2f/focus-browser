import { A_Entry } from '@src/renderer/src/entry-points/abstracts/abs-entry'
/* Utils */
import {
    byteToSize,
    checkElectron,
    getSection,
    ipcRenderer,
} from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { H1 } from '@src/renderer/src/template-parts/h1'
import { BackButton } from '@src/renderer/src/template-parts/back-button'
import { Card } from '@src/renderer/src/template-parts/card'
import { Loading } from '@src/renderer/src/template-parts/loading'
import { Notification } from '@src/renderer/src/template-parts/notification'
/* CONSTANTS */
import { IPC_CHANNELS, REQUEST_HANDLER } from '@src/common/constants'
/* T_Types */
import { T_Cleaner } from '@src/common/types'

class Cleaner extends A_Entry {
    private notification: Notification = new Notification().appendTo('root')

    private ready = false
    private cache = new Card('Cache').appendTo('grid').setOnClick(() => {
        if (!this.ready) {
            return
        }
        this.ready = false
        new Loading().appendTo(this.cache.description)
        ipcRenderer.send(
            IPC_CHANNELS.CLEANER,
            REQUEST_HANDLER.REMOVE,
            'cacheSize',
        )
    })
    private indexedDB = new Card('IndexedDB')
        .appendTo('grid')
        .setOnClick(() => {
            if (!this.ready) {
                return
            }
            this.ready = false
            new Loading().appendTo(this.indexedDB.description)
            ipcRenderer.send(
                IPC_CHANNELS.CLEANER,
                REQUEST_HANDLER.REMOVE,
                'indexedDB',
            )
        })
    private anchor = new Card('Anchor').appendTo('grid').setOnClick(() => {
        if (!this.ready) {
            return
        }
        this.ready = false
        new Loading().appendTo(this.anchor.description)
        ipcRenderer.send(IPC_CHANNELS.CLEANER, REQUEST_HANDLER.REMOVE, 'anchor')
    })
    private history = new Card('History').appendTo('grid').setOnClick(() => {
        if (!this.ready) {
            return
        }
        this.ready = false
        new Loading().appendTo(this.history.description)
        ipcRenderer.send(
            IPC_CHANNELS.CLEANER,
            REQUEST_HANDLER.REMOVE,
            'history',
        )
    })
    private popups = new Card('Blocked Popups')
        .appendTo('grid')
        .setOnClick(() => {
            if (!this.ready) {
                return
            }
            this.ready = false
            new Loading().appendTo(this.popups.description)
            ipcRenderer.send(
                IPC_CHANNELS.CLEANER,
                REQUEST_HANDLER.REMOVE,
                'popups',
            )
        })

    constructor() {
        super()

        // Title
        const h1 = new H1('Cleaner 🧼').prependTo(getSection('title'))
        new BackButton().prependTo(h1.element)

        new Loading().appendTo(this.cache.description)
        new Loading().appendTo(this.indexedDB.description)
        new Loading().appendTo(this.anchor.description)
        new Loading().appendTo(this.history.description)
        new Loading().appendTo(this.popups.description)

        this.request()
    }

    private request(): void {
        ipcRenderer.send(IPC_CHANNELS.CLEANER, REQUEST_HANDLER.REQUEST)

        ipcRenderer.on(IPC_CHANNELS.CLEANER, (handler, ...args: unknown[]) => {
            if (handler !== REQUEST_HANDLER.RESPONSE) {
                return
            }

            // TODO
            const sizes = args[0] as T_Cleaner
            const updated = args[1] as boolean

            if (updated) {
                this.notification.info('Cleaned!')
            }

            this.cache.description = byteToSize(sizes.cacheSize)
            this.indexedDB.description = byteToSize(sizes.indexedDB)
            this.anchor.description = sizes.anchors.toString()
            this.history.description = sizes.history.toString()
            this.popups.description = sizes.popup.toString()
            this.ready = true
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Cleaner()
})
