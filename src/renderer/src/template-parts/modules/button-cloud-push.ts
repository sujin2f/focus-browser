import { Button } from '@home/template-parts/button'
/* CONSTANTS */
import {
    BROWSER,
    EMOJI,
    IPC_CHANNELS,
    REQUEST_HANDLER,
    SUJINC_URL,
} from '@src/common/constants'
/* Utils */
import { getSection, ipcRenderer, navigate } from '@src/renderer/src/utils'
/* Models */
import { Logger } from '@src/renderer/src/utils/logger'
/* T_Types */
import type { T_Cloud_Item } from '@src/common/types'
/* <HTML template-part /> */
import { Loading } from '@home/template-parts/loading'

export class ButtonCloudPush extends Button {
    constructor(
        private item: T_Cloud_Item,
        private getUserInfo: () => string | undefined,
    ) {
        super(EMOJI.GLOBE, 'button-clear')
    }

    public setOnClick(
        callback: ((e: PointerEvent) => boolean) | (() => boolean),
    ) {
        super.setOnClick((e) => {
            const result = callback(e)
            this.sendCloudPush(result)
        })
        return this
    }

    public sendCloudPush(enabled: boolean) {
        if (!enabled) {
            return
        }

        Logger.getInstance().log('Sending an item to Cloud', this.item.title)
        Logger.getInstance().log(`sendCloudPush()`)
        if (!this.getUserInfo()) {
            getSection('login-alert').classList.remove('hidden')
            getSection('login-alert')
                .querySelector('button')
                ?.addEventListener('click', () => {
                    navigate({
                        scene: BROWSER,
                        address: SUJINC_URL,
                    })
                })
            return
        }

        Logger.getInstance().log('Sending an item to Cloud', this.item.title)
        ipcRenderer.send(IPC_CHANNELS.CLOUD, REQUEST_HANDLER.PUT, {
            item: this.item,
        })
    }

    public set loading(loading: boolean) {
        this.element.innerHTML = ''

        if (!loading) {
            this.element.innerHTML = this._title
            return
        }

        new Loading().appendTo(this.element)
    }
}
