import { A_ListSearch } from '@home/entry-points/abstracts/abs-list-search'
/* Utils */
import { ipcRenderer } from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { Notification } from '@home/template-parts/notification'
/* CONSTANTS */
import { IPC_CHANNELS, REQUEST_HANDLER } from '@src/common/constants'
/* T_Types */
import type { T_Cloud_Item } from '@src/common/types'
import type { T_IPC_Data } from '@src/common/types/ipc'
/* Models */
import { Logger } from '@src/common/logger'

export abstract class A_ListCloudPush<T> extends A_ListSearch<T> {
    protected notification: Notification = new Notification().appendTo('root')
    protected currentUrl = ''
    protected hasCloudItem: Set<string> = new Set()

    constructor(css: string = '') {
        super(css)
        this.setIpcCloudHandler()
    }

    protected setIpcCloudHandler() {
        ipcRenderer.on(IPC_CHANNELS.CLOUD, (handler, message) => {
            switch (handler) {
                case REQUEST_HANDLER.RESPONSE_FAIL:
                    this.callbackCloudResponseFail(message)
                    return
                case REQUEST_HANDLER.RESPONSE_SUCCESS:
                    this.callbackCloudResponseSuccess(message)
                    return
            }
        })
    }

    protected callbackCloudResponseFail(message?: T_IPC_Data<T_Cloud_Item>) {
        Logger.init().log(`callbackCloudResponseFail()`)
        this.setEnabled(true)
        if (message?.message) this.notification.error(message.message)
        if (this.currentUrl) this.hasCloudItem.add(this.currentUrl)
    }

    protected callbackCloudResponseSuccess(message?: T_IPC_Data<T_Cloud_Item>) {
        Logger.init().log(`callbackCloudResponseSuccess()`)
        this.setEnabled(true)
        if (message?.message) this.notification.info(message.message)
        if (this.currentUrl) this.hasCloudItem.add(this.currentUrl)
    }
}
