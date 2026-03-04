/* Models */
import { Abs_Database } from '@home/utils/indexedDB/abs-database'
import { Logger } from '@src/common/logger'
/* Utils */
import { getSafeUrl } from '@src/common/utils/common'
/* T_Types */
import type { T_Bookmark } from '@src/common/types/store'
/* CONSTANTS */
import { BOOKMARK_TYPES } from '@src/common/constants'

export class Bookmark extends Abs_Database<'bookmark'> {
    protected readonly STORE = 'bookmark'

    public getAll(
        type: BOOKMARK_TYPES,
        callback: (result: T_Bookmark[]) => void,
    ) {
        const store = this.getStore()
        Logger.init().info(`indexedDB::Bookmark::set(getAll)`, store)
        // 🤬 DB does not exist
        if (!store) return

        const index = store.index('type')
        const request = index.getAll(type)
        request.onsuccess = async () => {
            Logger.init().info(`indexedDB::Bookmark::onsuccess`)
            callback(request.result)
        }
        request.onerror = () => {
            Logger.init().error('indexedDB::get() request.onerror')
            callback([])
        }
    }

    public add(
        bookmarks: T_Bookmark | T_Bookmark[],
        callback?: (result?: boolean) => void,
    ) {
        const tx = this.getTransaction('readwrite')
        // 🤬 DB does not exist
        if (!tx) return

        if (!Array.isArray(bookmarks)) {
            this.forceAdd(bookmarks, tx)
        } else {
            bookmarks.forEach((bookmark) => {
                this.forceAdd(bookmark, tx)
            })
        }

        tx.oncomplete = () => {
            if (callback) callback(true)
        }
    }

    private forceAdd(bookmark: T_Bookmark, tx: IDBTransaction) {
        if (bookmark.dir) {
            tx.objectStore(this.STORE).add({
                ...bookmark,
                id: bookmark.id || window.crypto.randomUUID().toString(),
            } satisfies T_Bookmark)
            return
        }

        // 🤬 Prevent URL duplication
        if (!getSafeUrl(bookmark.url)) return
        const index = tx.objectStore(this.STORE).index('url')
        const query = index.get(bookmark.url)
        query.onsuccess = () => {
            if (query.result) return
            tx.objectStore(this.STORE).add({
                ...bookmark,
                id: bookmark.id || window.crypto.randomUUID().toString(),
            } satisfies T_Bookmark)
        }
    }

    public update(bookmark: T_Bookmark, callback?: (result: boolean) => void) {
        Logger.init().info(`indexedDB::Bookmark::remove(${bookmark})`)
        const store = this.getStore('readwrite')
        // 🤬 DB does not exist
        if (!store) return

        const mutation = store.put(bookmark)
        mutation.onsuccess = () => {
            Logger.init().info('indexedDB::Bookmark::remove() done')
            if (callback) callback(true)
        }
        mutation.onerror = () => {
            if (callback) callback(false)
            Logger.init().info('indexedDB::Bookmark::remove() fail')
        }
    }

    public removeAll(
        type: BOOKMARK_TYPES,
        callback: (result: boolean) => void,
    ) {
        const tx = this.getTransaction('readwrite')
        // 🤬 DB does not exist
        if (!tx) return

        this.getAll(type, (bookmarks) => {
            bookmarks.forEach((bookmark) => {
                if (bookmark.uid) this.remove(bookmark.uid)
            })
        })

        tx.oncomplete = () => {
            if (callback) callback(true)
        }
    }

    public remove(id: number, callback?: (result: boolean) => void): void {
        Logger.init().info(`indexedDB::Bookmark::remove(${id})`)
        const store = this.getStore('readwrite')
        // 🤬 DB does not exist
        if (!store) return

        const mutation = store.delete(id)
        mutation.onsuccess = () => {
            Logger.init().info('indexedDB::Bookmark::remove() done')
            if (callback) callback(true)
        }
        mutation.onerror = () => {
            if (callback) callback(false)
            Logger.init().info('indexedDB::Bookmark::remove() fail')
        }
    }

    get(_: unknown, __: (result: T_Bookmark) => void): void {
        throw new Error('Method not implemented.')
    }
}
