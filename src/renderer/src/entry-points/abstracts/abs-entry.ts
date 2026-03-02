/* Utils */
import { ipcRenderer, navigate } from '@home/utils'
/* Models */
import { Logger } from '@home/utils/logger'
import { Favicon } from '@home/utils/favicon'
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
    protected favicon = new Favicon()

    constructor() {
        document.addEventListener('keydown', this.callbackShortcut.bind(this))
        this.setFaviconUpdater()
    }

    protected callbackShortcut(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            navigate()
        }
    }

    protected requestStatus(...keys: (keyof T_Status_Props)[]) {
        Logger.getInstance().log(`requestStatus ${JSON.stringify(keys)}`)

        ipcRenderer.once(
            IPC_CHANNELS.STATUS,
            (handler, status = { data: {} }) => {
                if (handler !== REQUEST_HANDLER.RESPONSE) {
                    return
                }
                Logger.getInstance().info(
                    `Get status ${JSON.stringify(status)}`,
                )
                this.settings = { ...this.settings, ...status.data }
            },
        )

        ipcRenderer.send(IPC_CHANNELS.STATUS, REQUEST_HANDLER.REQUEST, {
            request: keys,
        })
    }

    protected callbackUpdateStatus() {}

    private setFaviconUpdater() {
        ipcRenderer.on(IPC_CHANNELS.FAVICON, (handler, response = ['', '']) => {
            switch (handler) {
                case REQUEST_HANDLER.REQUEST:
                    this.favicon.get(response[0], (image) => {
                        if (image) {
                            this.favicon.update(image)
                            return
                        }
                        ipcRenderer.send(
                            IPC_CHANNELS.FAVICON,
                            REQUEST_HANDLER.RESPONSE_FAIL,
                            [response[0], ''],
                        )
                    })
                    return
                case REQUEST_HANDLER.RESPONSE_SUCCESS:
                    Logger.getInstance().info(
                        'FAVICON RESPONSE_SUCCESS',
                        response,
                    )
                    if (!response[0] || !response[1]) return
                    this.favicon.set(response[0], response[1])
                    return
            }
        })
    }
}
