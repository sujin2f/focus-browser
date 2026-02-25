import { A_List } from '@home/entry-points/abstracts/abs-list'
/* Utils */
import { getSection, ipcRenderer, navigate } from '@home/utils'
/* <HTML template-part /> */
import { Notification } from '@home/template-parts/notification'
/* CONSTANTS */
import {
    BROWSER,
    IPC_CHANNELS,
    REQUEST_HANDLER,
    SUJINC_URL,
} from '@src/common/constants'

export abstract class A_TraitCloudPush<T> {
    constructor(
        private parent: A_List<T>,
        private notification: Notification,
    ) {
        this.setIpcCloudHandler()
    }

    private setIpcCloudHandler() {
        ipcRenderer.on(IPC_CHANNELS.CLOUD, (handler, message = []) => {
            switch (handler) {
                case REQUEST_HANDLER.RESPONSE_FAIL:
                    this.notification.error(message[0].title)
                    return
                case REQUEST_HANDLER.RESPONSE_SUCCESS:
                    this.notification.info(message[0].title)
                    return
            }
        })
    }

    public sendCloudPush(_: T): boolean {
        if (!this.parent.settings.userInfo) {
            getSection('login-alert').classList.remove('hidden')
            getSection('login-alert')
                .querySelector('button')
                ?.addEventListener('click', () => {
                    navigate({
                        scene: BROWSER,
                        address: SUJINC_URL,
                    })
                })
            return false
        }
        return true
    }
}
