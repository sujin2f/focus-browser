import { ipcRenderer, navigate } from '@src/renderer/src/utils'
import { Logger } from '@src/common/logger'
import type { Info } from '@src/common/types'
import { IPC_CHANNELS, RequestHandler } from '@src/common/constants'

import '@home/styles/common.css'

export abstract class A_Entry {
    protected _settings: Partial<Info> = {}
    protected get settings() {
        return this._settings
    }
    protected set settings(settings: Partial<Info>) {
        this._settings = settings
        this.callbackUpdateInfo()
    }

    constructor() {
        document.addEventListener('keydown', this.callbackShortcut.bind(this))
    }

    protected callbackShortcut(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            navigate()
        }
    }

    protected requestInfo(...keys: (keyof Info)[]) {
        Logger.getInstance().log(
            `[Renderer] requestInfo ${JSON.stringify(keys)}`,
        )

        ipcRenderer.once(IPC_CHANNELS.INFO, (...args: unknown[]) => {
            const handler = args[0] as RequestHandler
            const setting = args[1] as Info

            if (handler !== RequestHandler.RESPONSE) {
                return
            }
            Logger.getInstance().info(
                `[Renderer] Get Info ${JSON.stringify(setting)}`,
            )
            this.settings = { ...this.settings, ...setting }
        })

        ipcRenderer.send(IPC_CHANNELS.INFO, RequestHandler.REQUEST, ...keys)
    }

    protected callbackUpdateInfo() {}
}
