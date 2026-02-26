import { utilityProcess } from 'electron'
/* Utils */
import { paths, getIndexedDBPath } from '@src/common/utils/fs'
import { byteToSize } from '@src/common/utils/common'
/* Models */
import { Anchors } from '@main/modules/store/anchors'
import { PopupBlocker } from '@src/main/modules/store/popup-blocker'
import { Logger } from '@main/logger'
/* T_Types */
import type { CenterView } from '@src/main/modules/view/centre'
import type { BrowserView } from '@src/main/modules/view/browser'
/* CONSTANTS */
import {
    IPC_CHANNELS,
    REQUEST_HANDLER,
    SUJINC_URL,
} from '@src/common/constants'

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
    })
}

export const removeIndexedDB = (centre: CenterView): void => {
    const child = utilityProcess.fork(paths.childProcess)
    child.postMessage({ channel: 'remove-directory', path: getIndexedDBPath() })
    child.once('message', () => {
        centre.send(IPC_CHANNELS.CLEANER, REQUEST_HANDLER.RESPONSE_SUCCESS)
    })
}

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

        if (message.status === 404) {
            centre.send(IPC_CHANNELS.CLOUD, REQUEST_HANDLER.RESPONSE_FAIL, [
                {
                    title: `You don't have anything in the cloud.`,
                    key: '',
                    type: 'return',
                },
            ])
            return
        }

        if (message.body.error) {
            Logger.getInstance().error(
                `${SUJINC_URL}/focus/items failed with ${message.body.error}`,
            )
            centre.send(IPC_CHANNELS.CLOUD, REQUEST_HANDLER.RESPONSE_FAIL, [
                { title: message.body.error, key: '', type: 'return' },
            ])
            return
        }

        Logger.getInstance().log(
            `Sending items to renderer: sample `,
            message.body.result[0],
        )
        centre.send(
            IPC_CHANNELS.CLOUD,
            REQUEST_HANDLER.RESPONSE,
            message.body.result,
        )
    })
}
