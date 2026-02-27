import { ipcRenderer, navigate } from '@src/renderer/src/utils'
import { Logger } from '@src/renderer/src/utils/logger'
import type { T_Status_Props } from '@src/common/types'
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

    constructor() {
        document.addEventListener('keydown', this.callbackShortcut.bind(this))
    }

    protected callbackShortcut(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            navigate({})
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
}
