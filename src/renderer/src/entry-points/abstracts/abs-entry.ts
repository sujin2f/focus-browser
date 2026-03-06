/* Utils */
import { ipcRenderer, navigate } from '@home/utils'
/* Models */
import { Logger } from '@src/common/logger'
import { Favicon } from '@home/utils/indexedDB/favicon'
import { Bookmark } from '@home/utils/indexedDB/bookmark'
import { Anchor } from '@home/utils/indexedDB/anchor'
/* T_Types */
import type { T_Status_Props } from '@src/common/types'
/* CONSTANTS */
import { IPC_CHANNELS, REQUEST_HANDLER } from '@src/common/constants'

import '@src/renderer/styles/common.css'

export abstract class A_Entry {
    protected _settings: T_Status_Props = {}
    public get settings() {
        return this._settings
    }
    protected set settings(settings: T_Status_Props) {
        this._settings = settings
        this.callbackUpdateStatus()
    }
    protected faviconStore = new Favicon()
    protected bookmarkStore = new Bookmark()
    protected anchorStore = new Anchor()

    constructor() {
        document.addEventListener('keydown', this.callbackShortcut.bind(this))
        this.initIpcHandler()
    }

    protected callbackShortcut(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            navigate()
        }
    }

    protected requestStatus(...keys: (keyof T_Status_Props)[]) {
        Logger.init().log(`requestStatus ${JSON.stringify(keys)}`)

        ipcRenderer.once(
            IPC_CHANNELS.STATUS,
            (handler, status = { data: {} }) => {
                if (handler !== REQUEST_HANDLER.RESPONSE) {
                    return
                }
                Logger.init().info(`Get status ${JSON.stringify(status)}`)
                this.settings = { ...this.settings, ...status.data }
            },
        )

        ipcRenderer.send(IPC_CHANNELS.STATUS, REQUEST_HANDLER.REQUEST, {
            request: keys,
        })
    }

    protected callbackUpdateStatus() {}

    private initIpcHandler() {
        // 🅕 Favicon
        ipcRenderer.on(IPC_CHANNELS.FAVICON, (handler, response = ['', '']) => {
            switch (handler) {
                case REQUEST_HANDLER.REQUEST:
                    this.faviconStore.get(response[0], (image) => {
                        // 😃 Already exist
                        if (image) return

                        ipcRenderer.send(
                            IPC_CHANNELS.FAVICON,
                            REQUEST_HANDLER.RESPONSE_FAIL,
                            [response[0], ''],
                        )
                    })
                    return
                case REQUEST_HANDLER.RESPONSE_SUCCESS:
                    Logger.init().info('FAVICON RESPONSE_SUCCESS', response)
                    // 🤬 Invalid
                    if (!response[0] || !response[1]) return

                    this.faviconStore.add({
                        host: response[0],
                        image: response[1],
                        timestamp: 0,
                    })
                    return
            }
        })

        // 🔖 Bookmark
        ipcRenderer.on(IPC_CHANNELS.BOOKMARK, (handler, response) => {
            // 🤬 Invalid
            if (!response) return

            if (
                handler === REQUEST_HANDLER.ADD &&
                !Array.isArray(response) &&
                typeof response !== 'string'
            )
                this.bookmarkStore.add(response)
        })

        // ⚓️ Anchor
        ipcRenderer.on(IPC_CHANNELS.ANCHOR, (handler, response) => {
            // 🤬 Invalid
            if (!response) return

            if (handler === REQUEST_HANDLER.ADD && !Array.isArray(response))
                this.anchorStore.add(response)
        })
    }
}
