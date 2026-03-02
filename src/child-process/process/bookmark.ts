/* Models */
import { Bookmarks } from '@main/store/bookmarks'
/* T_Types */
import type { T_Bookmark } from '@src/common/types/store'

/**
 * @deprecated
 */
export const getBookmarks = (path: string) => {
    const store = new Bookmarks(path)
    const dirKeys = Object.keys(store.get('dirs')).filter((v) => v)
    const bookmarks = [
        ...Object.values(store.get('dirs')).map(
            (item) =>
                ({
                    ...item,
                    dir: true,
                    parent: '',
                    url: '',
                    type: 'bookmark',
                }) satisfies T_Bookmark,
        ),
        ...Object.values(store.get('items'))
            .filter((item) => item.url)
            .map(
                (item) =>
                    ({
                        ...item,
                        type: 'bookmark',
                        dir: false,
                        parent: dirKeys.includes(item.parent || '')
                            ? item.parent
                            : '',
                    }) satisfies T_Bookmark,
            ),
    ]

    process.parentPort.postMessage(bookmarks)
}
