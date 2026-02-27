import { app, utilityProcess } from 'electron'
/* Utils */
import { paths } from '@src/common/utils/fs'
/* Models */
import { Logger } from '@main/logger'
/* CONSTANTS */
import { IPC_CHANNELS, REQUEST_HANDLER } from '@src/common/constants'
/* T_Types */
import type { CenterView } from '@src/main/modules/view/centre'
import type { T_Bookmark, T_IPC_Data } from '@src/common/types'

export const responseBookmarks = (centre: CenterView) => {
    const child = utilityProcess.fork(paths.childProcess)
    child.postMessage({
        channel: 'list-bookmark',
        path: app.getPath('userData'),
    })
    child.once('message', (message) => {
        centre.send(
            IPC_CHANNELS.BOOKMARKS_RESPONSE,
            REQUEST_HANDLER.RESPONSE_SUCCESS,
            message,
        )
        Logger.getInstance().log('👶', 'Bookmark list request finished')
        child.kill()
    })
}

const getChannel = (request: REQUEST_HANDLER) => {
    switch (request) {
        case REQUEST_HANDLER.ADD:
            return 'add-bookmark'
        case REQUEST_HANDLER.MODIFY:
            return 'update-bookmark'
        case REQUEST_HANDLER.REMOVE:
            return 'remove-bookmark'
    }

    Logger.getInstance().error('👶', `Handler ${request} does not matched.`)
    throw new Error(`👶 Handler ${request} does not matched.`)
}

export const modifyBookmark = (
    request: REQUEST_HANDLER,
    centre: CenterView,
    args: T_IPC_Data<T_Bookmark>,
) => {
    const child = utilityProcess.fork(paths.childProcess)
    const channel = getChannel(request)
    child.postMessage({
        channel,
        path: app.getPath('userData'),
        args,
    })
    child.once('message', (message) => {
        centre.send(IPC_CHANNELS.BOOKMARK, message.handler, {
            item: message.item,
            meta: message.meta,
        })

        if (message.handler === REQUEST_HANDLER.RESPONSE_SUCCESS) {
            Logger.getInstance().log('👶', `Child process ${channel} finished.`)
        } else {
            Logger.getInstance().error('👶', `Child process ${channel} failed.`)
        }

        child.kill()
    })
}
