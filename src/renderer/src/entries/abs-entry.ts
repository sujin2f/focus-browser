import { ipcRenderer, navigate } from '@src/renderer/src/utils'
import { Logger } from '@src/common/logger'
import type { Info } from '@src/common/types'
import { Channel, RequestHandler } from '@src/common/constants'

export abstract class A_Entry {
    protected _settings: Partial<Info> = {}
    protected get settings() {
        return this._settings
    }
    protected set settings(settings: Partial<Info>) {
        this._settings = settings
        this.callbackUpdateInfo()
    }

    protected get root() {
        const root = document.querySelector<HTMLElement>('#root')
        if (!root) {
            // TODO ipc
            throw new Error('No root element exist')
        }
        return root
    }

    constructor() {
        document.addEventListener('keydown', this.callbackShortcut)
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

        ipcRenderer.once(Channel.INFO, (...args: unknown[]) => {
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

        ipcRenderer.send(Channel.INFO, RequestHandler.REQUEST, ...keys)
    }

    protected callbackUpdateInfo() {}
}
