/* Models */
import { Abs_Database } from '@home/utils/indexedDB/abs-database'
import { Logger } from '@home/utils/logger'
/* Utils */
import { getSafeUrl } from '@src/common/utils/common'
/* T_Types */
import type { T_Bookmark } from '@src/common/types/store'

export class Bookmark extends Abs_Database<'bookmark'> {
    protected readonly STORE = 'bookmark'

    public getAll(type: string, callback: (result: T_Bookmark[]) => void) {
        const store = this.getStore()
        Logger.getInstance().info(`indexedDB::Bookmark::set(getAll)`, store)
        // 🤬 DB does not exist
        if (!store) return

        const index = store.index('type')
        const request = index.getAll(type)
        request.onsuccess = async () => {
            Logger.getInstance().info(`indexedDB::Bookmark::onsuccess`)
            callback(request.result)
        }
        request.onerror = () => {
            Logger.getInstance().error('indexedDB::get() request.onerror')
            callback([])
        }
    }
    public add(_bookmark: T_Bookmark, callback?: (result?: boolean) => void) {
        Logger.getInstance().info(
            `indexedDB::set(${JSON.stringify(_bookmark)})`,
        )
        const store = this.getStore('readwrite')
        // 🤬 DB does not exist
        if (!store) return

        if (!_bookmark.dir) {
            if (!getSafeUrl(_bookmark.url)) return
        }

        const index = store.index('url')
        const query = index.get(_bookmark.url)
        query.onsuccess = () => {
            if (query.result) return

            const bookmark = {
                ..._bookmark,
                id: _bookmark.id || window.crypto.randomUUID().toString(),
            }

            const mutation = store.add(bookmark)
            mutation.onsuccess = () => {
                Logger.getInstance().info('indexedDB::Bookmark::set() done')
                if (callback) callback(true)
            }
            mutation.onerror = () => {
                if (callback) callback(false)
                Logger.getInstance().info('indexedDB::Bookmark::set() fail')
            }
        }
        query.onerror = () => {
            if (callback) callback(false)
            Logger.getInstance().info('indexedDB::Bookmark::set() fail')
        }
    }

    public update(bookmark: T_Bookmark, callback?: (result: boolean) => void) {
        Logger.getInstance().info(`indexedDB::Bookmark::remove(${bookmark})`)
        const store = this.getStore('readwrite')
        // 🤬 DB does not exist
        if (!store) return

        const mutation = store.put(bookmark)
        mutation.onsuccess = () => {
            Logger.getInstance().info('indexedDB::Bookmark::remove() done')
            if (callback) callback(true)
        }
        mutation.onerror = () => {
            if (callback) callback(false)
            Logger.getInstance().info('indexedDB::Bookmark::remove() fail')
        }
    }

    public remove(id: number, callback: (result: boolean) => void): void {
        Logger.getInstance().info(`indexedDB::Bookmark::remove(${id})`)
        const store = this.getStore('readwrite')
        // 🤬 DB does not exist
        if (!store) return

        const mutation = store.delete(id)
        mutation.onsuccess = () => {
            Logger.getInstance().info('indexedDB::Bookmark::remove() done')
            if (callback) callback(true)
        }
        mutation.onerror = () => {
            if (callback) callback(false)
            Logger.getInstance().info('indexedDB::Bookmark::remove() fail')
        }
    }

    get(_: unknown, __: (result: T_Bookmark) => void): void {
        throw new Error('Method not implemented.')
    }
}
