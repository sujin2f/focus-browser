import { utilityProcess } from 'electron'
/* Utils */
import { paths, getIndexedDBPath } from '@src/common/utils/fs'
import { byteToSize } from '@src/common/utils/common'
/* Models */
import { Anchors } from '@main/store/anchors'
import { PopupBlocker } from '@main/store/popup-blocker'
import { Logger } from '@main/lib/logger'
/* T_Types */
import type { CenterView } from '@main/modules/view/centre'
import type { BrowserView } from '@main/modules/view/browser'
/* CONSTANTS */
import { IPC_CHANNELS, REQUEST_HANDLER } from '@src/common/constants'

export const getCleanerSizes = (
    browser: BrowserView,
    centre: CenterView,
    handler: REQUEST_HANDLER,
): void => {
    const child = utilityProcess.fork(paths.childProcess)
    child.postMessage({ channel: 'directory-size', path: getIndexedDBPath() })
    child.once('message', async (indexedDB) => {
        const anchors = Object.keys(new Anchors().get()).length.toString()
        const popup = PopupBlocker.getInstance().get('blocked')
        const cacheSize = await browser.webContents.session
            .getCacheSize()
            .catch(() => {
                Logger.getInstance().error('Failed to get cache size.')
                return 0
            })
        const history = browser.webContents.navigationHistory
            .getAllEntries()
            .length.toString()

        centre.send(IPC_CHANNELS.CLEANER, handler, {
            response: {
                cacheSize: byteToSize(cacheSize),
                indexedDB: byteToSize(indexedDB),
                history,
                popup: Array.from(popup).length.toString(),
                anchors,
            },
        })
        child.kill()
    })
}

export const removeIndexedDB = (centre: CenterView): void => {
    const child = utilityProcess.fork(paths.childProcess)
    child.postMessage({ channel: 'remove-directory', path: getIndexedDBPath() })
    child.once('message', () => {
        centre.send(IPC_CHANNELS.CLEANER, REQUEST_HANDLER.RESPONSE_SUCCESS)
        child.kill()
    })
}
