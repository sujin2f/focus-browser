import { net } from 'electron'
/* Utils */
import { removeDirectory } from '@src/common/utils/fs'
/* T_Types */
import type { T_Bookmark, T_IPC_Data } from '@src/common/types'
/* Models */
import { getCleanerData } from '@src/child-process/process/cleaner'
import {
    getAnchors,
    removeAnchor,
    addAnchor,
    clearAnchor,
} from '@src/child-process/process/anchor'
import {
    addBookmark,
    getBookmarks,
    removeBookmark,
    updateBookmark,
} from '@src/child-process/process/bookmark'
import {
    fetchCloudItems,
    removeCloudItem,
    uploadCloudItem,
} from '@src/child-process/process/cloud'

process.parentPort.once('message', (e) => {
    switch (e.data.channel) {
        case 'cleaner-data':
            getCleanerData(e.data.indexedDB, e.data.userData)
            return

        case 'remove-directory':
            removeDirectory(e.data.path)
            process.parentPort.postMessage(true)
            return

        case 'fetch-cloud-items':
            fetchCloudItems(e.data.token, e.data.email)
            return

        case 'upload-cloud-item':
            uploadCloudItem(e.data.item, e.data.machineId, e.data.token)
            return

        case 'remove-cloud-item':
            removeCloudItem(e.data._id, e.data.token)
            return

        case 'list-bookmark': {
            getBookmarks(e.data.path)
            return
        }

        case 'add-bookmark': {
            const { item, meta } = e.data.args as T_IPC_Data<T_Bookmark>
            addBookmark(e.data.path, item!, Boolean(meta))
            return
        }

        case 'update-bookmark': {
            const { item, meta } = e.data.args as T_IPC_Data<T_Bookmark>
            updateBookmark(e.data.path, item!, Boolean(meta))
            return
        }

        case 'remove-bookmark': {
            const { item, meta } = e.data.args as T_IPC_Data<T_Bookmark>
            removeBookmark(e.data.path, item!, Boolean(meta))
            return
        }
        case 'list-anchor':
            getAnchors(e.data.path)
            return

        case 'remove-anchor':
            removeAnchor(e.data.path, e.data.url)
            return

        case 'add-anchor':
            addAnchor(e.data.path, e.data.url, e.data.title)
            return

        case 'clear-anchor':
            clearAnchor(e.data.path)
            return

        case 'test': {
            console.log(net)
            // const userData = app.getPath('userData')
            // process.parentPort.postMessage(userData)
            return
        }
    }
})
