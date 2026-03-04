/* Models */
import { Bookmarks } from '@main/store/bookmarks'
import { BOOKMARK_TYPES } from '@src/common/constants'
import { Logger } from '@src/common/logger'
/* T_Types */
import type { T_Bookmark } from '@src/common/types/store'

/**
 * @deprecated
 */
export const getBookmarks = (path: string) => {
    const store = new Bookmarks(path)
    Logger.init().info(store.get('dirs'), store.get('items'))
    const dirKeys = Object.keys(store.get('dirs')).filter((v) => v)
    const bookmarks = [
        ...Object.values(store.get('dirs')).map(
            (item) =>
                ({
                    ...item,
                    dir: true,
                    parent: '',
                    url: '',
                    type: BOOKMARK_TYPES.BOOKMARK,
                }) satisfies T_Bookmark,
        ),
        ...Object.values(store.get('items'))
            .filter((item) => item.url)
            .map(
                (item) =>
                    ({
                        ...item,
                        type: BOOKMARK_TYPES.BOOKMARK,
                        dir: false,
                        parent: dirKeys.includes(item.parent || '')
                            ? item.parent
                            : '',
                    }) satisfies T_Bookmark,
            ),
    ]
    Logger.init().info(bookmarks)

    process.parentPort.postMessage(bookmarks)
}
