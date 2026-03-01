/* Models */
import { Bookmarks } from '@main/store/bookmarks'
/* CONSTANTS */
import { REQUEST_HANDLER } from '@src/common/constants'
/* T_Types */
import type { T_Bookmark, T_Bookmark_Store } from '@src/common/types'
/* Utils */
import { base64decode } from '@src/common/utils/security'
// import { Favicon } from '@src/main/store/favicon'

export const getBookmarks = (path: string) => {
    const store = new Bookmarks(path)
    // const favicon = new Favicon(path)
    // const items = store.get('items')!

    // for (const id of Object.keys(items)) {
    //     items[id].favicon = favicon.get(items[id].url) || ''
    // }

    process.parentPort.postMessage({
        dirs: store.get('dirs')!,
        items: store.get('items')!,
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

    // // Register favicon
    // const favicon = await new Favicon(path)
    //     .store(async (store) => {
    //         let favicon = store.get(bookmark.url)
    //         if (favicon) return favicon

    //         favicon = await store.set(bookmark.url)
    //         store.save()
    //         return favicon
    //     })
    //     .catch(() => '')

    const store = new Bookmarks(path)
    const result = store.push(bookmark, isDir)
    store.save()

    // if (result) result.favicon = favicon
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
    // TODO remove favicon
    store.save()
    process.parentPort.postMessage({
        handler: REQUEST_HANDLER.RESPONSE_SUCCESS,
        item: bookmark,
        meta: { isDir, action: 'removed' },
    })
}
