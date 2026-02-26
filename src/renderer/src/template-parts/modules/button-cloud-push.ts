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
import { getSection, ipcRenderer, navigate } from '@home/utils'
/* Models */
import { Logger } from '@src/renderer/logger'
/* T_Types */
import type { T_Cloud_Item } from '@src/common/types'
import { Loading } from '../loading'

export class ButtonCloudPush extends Button {
    constructor(
        private item: T_Cloud_Item,
        private getUserInfo: () => string | undefined,
        private callbackPush: (button: ButtonCloudPush) => void,
    ) {
        super(EMOJI.GLOBE, 'button-clear')
        this.setOnClick(() => {
            this.sendCloudPush()
        })
    }

    public sendCloudPush() {
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

        this.callbackPush(this)
        Logger.getInstance().log('Sending an item to Cloud', this.item.title)
        ipcRenderer.send(IPC_CHANNELS.CLOUD, REQUEST_HANDLER.PUT, [this.item])
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
