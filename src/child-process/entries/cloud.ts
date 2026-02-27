import { utilityProcess } from 'electron'
/* Utils */
import { paths } from '@src/common/utils/fs'
/* Models */
import { Status } from '@main/store/status'
import { Logger } from '@main/lib/logger'
/* T_Types */
import type { CenterView } from '@main/modules/view/centre'
import type { T_Cloud_Item } from '@src/common/types'
/* CONSTANTS */
import {
    IPC_CHANNELS,
    REQUEST_HANDLER,
    SUJINC_URL,
} from '@src/common/constants'

export const fetchCloudItems = (
    centre: CenterView,
    token: string,
    email: string,
) => {
    const child = utilityProcess.fork(paths.childProcess)
    child.postMessage({ channel: 'fetch-cloud-items', token, email })
    child.once('message', (message) => {
        Logger.getInstance().log(
            '👶',
            `${SUJINC_URL}/focus/items responded with ${message.status}`,
        )

        if (message.body.error) {
            Logger.getInstance().error(
                '👶',
                `${SUJINC_URL}/focus/items failed with ${message.body.error}`,
            )
            centre.send(IPC_CHANNELS.CLOUD, REQUEST_HANDLER.RESPONSE_FAIL, {
                message: message.body.error,
            })
            return
        }

        Logger.getInstance().log(
            '👶',
            `Sending items to renderer: sample `,
            message.body.result[0],
        )
        centre.send(
            IPC_CHANNELS.CLOUD,
            REQUEST_HANDLER.RESPONSE,
            message.body.result,
        )
        child.kill()
    })
}

export const uploadCloudItem = (
    centre: CenterView,
    item: T_Cloud_Item,
    token: string,
) => {
    Logger.getInstance().log('👶', `uploadCloudItem() triggered`)

    const child = utilityProcess.fork(paths.childProcess)
    const machineId = Status.getInstance().get('machineId')
    child.postMessage({ channel: 'upload-cloud-item', item, machineId, token })
    child.once('message', (message) => {
        Logger.getInstance().log(
            '👶',
            `${SUJINC_URL}/focus/item responded with ${message.status}`,
        )
        const handler =
            message.status === 200
                ? REQUEST_HANDLER.RESPONSE_SUCCESS
                : REQUEST_HANDLER.RESPONSE_FAIL

        centre.send(IPC_CHANNELS.CLOUD, handler, {
            message: message.body.message || message.body.error,
            item: { _id: message.body.id } as T_Cloud_Item,
        })
        child.kill()
    })
}

export const removeCloudItem = (
    centre: CenterView,
    _id: string,
    token: string,
) => {
    const child = utilityProcess.fork(paths.childProcess)
    child.postMessage({ channel: 'remove-cloud-item', _id, token })
    child.once('message', (message) => {
        Logger.getInstance().log(
            '👶',
            `${SUJINC_URL}/focus/item responded with ${message.status}`,
        )
        const handler =
            message.status === 200
                ? REQUEST_HANDLER.RESPONSE_SUCCESS
                : REQUEST_HANDLER.RESPONSE_FAIL

        centre.send(IPC_CHANNELS.CLOUD, handler, {
            message: message.body.message || message.body.error,
            item: { _id: message.body.id } as T_Cloud_Item,
        })
        child.kill()
    })
}
