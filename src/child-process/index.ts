/* Utils */
import { removeDirectory } from '@src/common/utils/fs'
/* Models */
import { getCleanerData } from '@src/child-process/process/cleaner'
import { getAnchors } from '@src/child-process/process/anchor'
import { getBookmarks } from '@src/child-process/process/bookmark'
import { fetchFavicon } from '@src/common/utils/common'

process.parentPort.once('message', (e) => {
    switch (e.data.channel) {
        case 'cleaner-data':
            getCleanerData(e.data.indexedDB, e.data.userData)
            return

        case 'remove-directory':
            removeDirectory(e.data.path)
            process.parentPort.postMessage(true)
            return

        /**
         * @deprecated
         */
        case 'list-bookmark': {
            getBookmarks(e.data.path)
            return
        }

        /**
         * @deprecated
         */
        case 'list-anchor':
            getAnchors(e.data.path)
            return

        case 'fetch-favicon': {
            fetchFavicon(e.data.url).then((favicon) =>
                process.parentPort.postMessage(favicon),
            )
            return
        }

        case 'test': {
            return
        }
    }
})
