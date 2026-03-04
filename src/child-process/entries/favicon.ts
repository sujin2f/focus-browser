import { utilityProcess } from 'electron'
/* Utils */
import { paths } from '@src/common/utils/fs'
/* Models */
import { Logger } from '@src/common/logger'
/* T_Types */
import type { CenterView } from '@main/modules/view/centre'
/* CONSTANTS */
import { EMOJI, IPC_CHANNELS, REQUEST_HANDLER } from '@src/common/constants'

export const fetchAndSendFavicon = (centre: CenterView, url: string) => {
    const child = utilityProcess.fork(paths.childProcess)
    child.postMessage({ channel: 'fetch-favicon', url })
    child.once('message', ([host, icon]) => {
        Logger.init().info(EMOJI.BABY, 'Get Favicon', host, icon)
        centre.send(IPC_CHANNELS.FAVICON, REQUEST_HANDLER.RESPONSE_SUCCESS, [
            host,
            icon,
        ])
        child.kill()
    })
}
