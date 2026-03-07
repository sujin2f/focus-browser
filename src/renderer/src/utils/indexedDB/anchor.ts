/* Models */
import { Abs_Database } from '@home/utils/indexedDB/abs-database'
import { Logger } from '@src/common/logger'
/* T_Types */
import type { T_Anchor, T_Bookmark_Partial } from '@src/common/types/store'

export class Anchor extends Abs_Database<'anchor'> {
    protected readonly STORE = 'anchor'

    public getAll(callback: (result: T_Anchor[]) => void) {
        const store = this.getStore()
        // 🤬 DB does not exist
        if (!store) return

        const request = store.getAll()
        request.onsuccess = async () => callback(request.result)
        request.onerror = () => callback([])
    }

    public add(
        anchors: T_Bookmark_Partial | T_Bookmark_Partial[],
        callback?: (result?: boolean) => void,
    ) {
        const tx = this.getTransaction('readwrite')
        // 🤬 DB does not exist
        if (!tx) return

        if (!Array.isArray(anchors)) {
            this.forceAdd(anchors, tx)
        } else {
            anchors.forEach((anchor) => this.forceAdd(anchor, tx))
        }

        tx.oncomplete = () => {
            if (callback) callback(true)
        }
    }

    private forceAdd(anchor: T_Bookmark_Partial, tx: IDBTransaction) {
        tx.objectStore(this.STORE).add({
            ...anchor,
            id: window.crypto.randomUUID().toString(),
        })
    }

    public removeAll(callback: (result: boolean) => void) {
        const store = this.getStore()
        // 🤬 DB does not exist
        if (!store) return

        const request = store.getAll()
        request.onsuccess = async () => {
            const tx = this.getTransaction('readwrite')
            if (!tx) return

            tx.oncomplete = () => {
                callback(true)
            }
            request.result.forEach((anchor) =>
                tx.objectStore(this.STORE).delete(anchor.uid),
            )
        }
        request.onerror = () => callback(false)
    }

    public remove(id: number, callback?: (result: boolean) => void): void {
        Logger.init().info(`indexedDB::Anchor::remove(${id})`)
        const store = this.getStore('readwrite')
        // 🤬 DB does not exist
        if (!store) return

        const mutation = store.delete(id)
        mutation.onsuccess = () => {
            Logger.init().info('indexedDB::Anchor::remove() done')
            if (callback) callback(true)
        }
        mutation.onerror = () => {
            if (callback) callback(false)
            Logger.init().info('indexedDB::Anchor::remove() fail')
        }
    }

    get(_: unknown, __: (result: T_Anchor) => void): void {
        throw new Error('Method not implemented.')
    }
    update(_: unknown, __?: unknown): void {
        throw new Error('Method not implemented.')
    }
}
