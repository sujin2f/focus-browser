/* Models */
import { Bookmarks } from '@main/store/bookmarks'
/* CONSTANTS */
import { REQUEST_HANDLER } from '@src/common/constants'
/* T_Types */
import type { T_Bookmark, T_Bookmark_Store } from '@src/common/types'
/* Utils */
import { base64decode } from '@src/common/utils/security'
import { fetchFavicon } from '@src/common/utils/common'

export const getBookmarks = (path: string) => {
    const store = new Bookmarks(path)
    process.parentPort.postMessage({
        dirs: store.get('dirs'),
        items: store.get('items'),
    } satisfies T_Bookmark_Store)
}

export const addBookmark = async (
    path: string,
    bookmark: T_Bookmark,
    isDir: boolean,
) => {
    if (!bookmark) {
        process.parentPort.postMessage({
            handler: REQUEST_HANDLER.RESPONSE_FAIL,
        })
        return
    }
    if (bookmark.id === 'from-cloud') {
        bookmark = JSON.parse(base64decode(bookmark.title))
    }

    if (!bookmark.favicon) {
        bookmark.favicon = await fetchFavicon(bookmark.url)
    }

    const store = new Bookmarks(path)
    const result = store.push(bookmark, isDir)
    store.save()
    const handler = !result
        ? REQUEST_HANDLER.RESPONSE_FAIL
        : REQUEST_HANDLER.RESPONSE_SUCCESS

    process.parentPort.postMessage({
        handler,
        item: result,
        meta: { isDir, action: 'added' },
    })
}

export const updateBookmark = (
    path: string,
    bookmark: T_Bookmark,
    isDir: boolean,
) => {
    if (!bookmark || !bookmark?.id) {
        process.parentPort.postMessage({
            handler: REQUEST_HANDLER.RESPONSE_FAIL,
        })
        return
    }
    const store = new Bookmarks(path)
    const result = store.update(bookmark, isDir)
    store.save()

    const handler = !result
        ? REQUEST_HANDLER.RESPONSE_FAIL
        : REQUEST_HANDLER.RESPONSE_SUCCESS

    process.parentPort.postMessage({
        handler,
        item: result,
        meta: { isDir, action: 'updated' },
    })
}

export const removeBookmark = (
    path: string,
    bookmark: T_Bookmark,
    isDir: boolean,
) => {
    if (!bookmark || !bookmark?.id) {
        process.parentPort.postMessage({
            handler: REQUEST_HANDLER.RESPONSE_FAIL,
        })
        return
    }
    const store = new Bookmarks(path)
    store.remove(bookmark.id, isDir)
    store.save()
    process.parentPort.postMessage({
        handler: REQUEST_HANDLER.RESPONSE_SUCCESS,
        item: bookmark,
        meta: { isDir, action: 'removed' },
    })
}
