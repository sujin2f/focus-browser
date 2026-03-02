/* Models */
import { Bookmarks } from '@main/store/bookmarks'
/* T_Types */
import type { T_Bookmark_Store } from '@src/common/types'

/**
 * @deprecated
 */
export const getBookmarks = (path: string) => {
    const store = new Bookmarks(path)
    process.parentPort.postMessage({
        dirs: store.get('dirs'),
        items: store.get('items'),
    } satisfies T_Bookmark_Store)
}
