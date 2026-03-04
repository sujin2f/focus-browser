/* Models */
import { Abs_Database } from '@home/utils/indexedDB/abs-database'
import { Logger } from '@src/common/logger'
/* T_Types */
import type { T_Bookmark, T_Bookmark_Partial } from '@src/common/types/store'

export class Bookmark extends Abs_Database<'bookmark'> {
    protected readonly STORE = 'bookmark'

    public getAll(callback: (result: T_Bookmark[]) => void) {
        const store = this.getStore()
        // 🤬 DB does not exist
        if (!store) return

        const request = store.getAll()
        request.onsuccess = async () => callback(request.result)
        request.onerror = () => callback([])
    }

    public add(
        bookmarks: T_Bookmark | T_Bookmark_Partial | T_Bookmark_Partial[],
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

    private forceAdd(
        bookmark: T_Bookmark | T_Bookmark_Partial,
        tx: IDBTransaction,
    ) {
        tx.objectStore(this.STORE).add({
            ...bookmark,
            id:
                (bookmark as T_Bookmark).id ||
                window.crypto.randomUUID().toString(),
        })
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

    public remove(uid: number, callback?: (result: boolean) => void): void {
        Logger.init().info(`indexedDB::Bookmark::remove(${uid})`)
        const store = this.getStore('readwrite')
        // 🤬 DB does not exist
        if (!store) return

        const mutation = store.delete(uid)
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
