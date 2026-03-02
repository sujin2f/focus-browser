import { app, utilityProcess } from 'electron'
/* Utils */
import { paths } from '@src/common/utils/fs'
/* Models */
import { Logger } from '@src/common/logger'
/* CONSTANTS */
import { IPC_CHANNELS, REQUEST_HANDLER } from '@src/common/constants'
/* T_Types */
import type { CenterView } from '@main/modules/view/centre'

/**
 * @deprecated
 */
export const responseBookmarks = (centre: CenterView) => {
    const child = utilityProcess.fork(paths.childProcess)
    child.postMessage({
        channel: 'list-bookmark',
        path: app.getPath('userData'),
    })
    child.once('message', (message) => {
        Logger.getInstance().log(
            '👶',
            'Bookmark list request finished',
            message.length,
        )
        centre.send(
            IPC_CHANNELS.BOOKMARK,
            REQUEST_HANDLER.RESPONSE_SUCCESS,
            message,
        )
        child.kill()
    })
}
