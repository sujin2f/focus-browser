import { A_Entry } from '@src/renderer/src/entry-points/abstracts/abs-entry'
/* Utils */
import { byteToSize, checkElectron, ipcRenderer } from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { H1 } from '@src/renderer/src/template-parts/h1'
import { BackButton } from '@src/renderer/src/template-parts/back-button'
import { Card } from '@src/renderer/src/template-parts/card'
import { Loading } from '@src/renderer/src/template-parts/loading'
import { Notification } from '@src/renderer/src/template-parts/notification'
/* CONSTANTS */
import { EMOJI, IPC_CHANNELS, REQUEST_HANDLER } from '@src/common/constants'

class Cleaner extends A_Entry {
    private notification: Notification = new Notification().appendTo('root')

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

        // Title
        const h1 = new H1(`Cleaner ${EMOJI.CLEANER}`).prependTo('title')
        new BackButton().prependTo(h1.element)

        new Loading().appendTo(this.cache.description)
        new Loading().appendTo(this.indexedDB.description)
        new Loading().appendTo(this.anchor.description)
        new Loading().appendTo(this.history.description)
        new Loading().appendTo(this.popups.description)

        this.request()
    }

    private request(): void {
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
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Cleaner()
})
