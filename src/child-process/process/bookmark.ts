/* Models */
import { Bookmarks } from '@main/store/bookmarks'
/* T_Types */
import type { T_Bookmark } from '@src/common/types/store'

/**
 * @deprecated
 */
export const getBookmarks = (path: string) => {
    const store = new Bookmarks(path)
    const dirs = store.get('dirs')
    const items = store.get('items')
    const bookmarks = [
        ...Object.keys(dirs).map((id) => dirs[id]),
        ...Object.keys(items).map((id) => items[id]),
    ] satisfies T_Bookmark[]

    process.parentPort.postMessage(bookmarks)
}
