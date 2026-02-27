import { A_ListSearch } from '@home/entry-points/abstracts/abs-list-search'
/* Utils */
import { ipcRenderer } from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { Notification } from '@home/template-parts/notification'
import { ButtonCloudPush } from '@home/template-parts/modules/button-cloud-push'
/* CONSTANTS */
import { IPC_CHANNELS, REQUEST_HANDLER } from '@src/common/constants'
/* T_Types */
import type { T_Cloud_Item } from '@src/common/types'
/* Models */
import { Logger } from '@src/renderer/src/utils/logger'

export abstract class A_ListCloudPush<T> extends A_ListSearch<T> {
    protected notification: Notification = new Notification().appendTo('root')
    protected currentButton?: ButtonCloudPush
    protected setEnabled(enabled: boolean) {
        super.setEnabled(enabled)
        if (this.currentButton) {
            this.currentButton.loading = !enabled
        }
    }

    constructor(css: string = '') {
        super(css)
        this.setIpcCloudHandler()
    }

    protected setIpcCloudHandler() {
        ipcRenderer.on(IPC_CHANNELS.CLOUD, (handler, message = []) => {
            switch (handler) {
                case REQUEST_HANDLER.RESPONSE_FAIL:
                    this.notification.error(message[0].title)
                    this.callbackCloudResponseFail(message)
                    return
                case REQUEST_HANDLER.RESPONSE_SUCCESS:
                    this.callbackCloudResponseSuccess(message)
                    this.notification.info(message[0].title)
                    return
            }
        })
    }

    protected callbackCloudResponseFail(_: T_Cloud_Item[]) {
        Logger.getInstance().log(`callbackCloudResponseFail()`)
        if (this.currentButton) {
            this.currentButton.disable()
        }
        this.setEnabled(true)
    }

    protected callbackCloudResponseSuccess(_: T_Cloud_Item[]) {
        Logger.getInstance().log(`callbackCloudResponseSuccess()`)
        if (this.currentButton) {
            this.currentButton.disable()
        }
        this.setEnabled(true)
    }

    protected callbackCloudPush(button: ButtonCloudPush) {
        Logger.getInstance().log(`callbackCloudPush()`)
        this.currentButton = button
        this.setEnabled(false)
    }
}
