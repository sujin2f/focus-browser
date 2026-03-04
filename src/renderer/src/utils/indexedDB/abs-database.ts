/* Models */
import { Logger } from '@src/common/logger'
/* T_Types */
import type { T_Stores } from '@src/common/types/store'

export abstract class Abs_Database<T extends keyof T_Stores> {
    private readonly DB_NAME = 'focus'
    private readonly VERSION = 2
    protected readonly STORE!: T
    public static DATABASE?: IDBDatabase
    public static INITIALIZED = false
    private readyCallback?: () => void

    constructor() {
        const request = window.indexedDB.open(this.DB_NAME, this.VERSION)
        request.onerror = () => Logger.init().error('Error loading database.')

        request.onsuccess = () => {
            Logger.init().info('Abs_Database::onsuccess.')
            Abs_Database.DATABASE = request.result
            if (this.readyCallback) {
                this.readyCallback()
                this.readyCallback = undefined
            }
        }

        request.onupgradeneeded = (e) => {
            // 😃 Already initialized
            if (Abs_Database.INITIALIZED) return
            Abs_Database.INITIALIZED = true

            const database = (e.target as IDBOpenDBRequest).result
            Logger.init().log('request.onupgradeneeded', database)
            // 🤬 DB does not exist
            if (!database) return

            Abs_Database.DATABASE = database

            // 🅕 Favicon
            const favicon = Abs_Database.DATABASE.createObjectStore('favicon', {
                keyPath: 'host',
            })
            favicon.createIndex('timestamp', 'timestamp', { unique: false })

            // 🔖 Bookmark
            const bookmark = Abs_Database.DATABASE.createObjectStore(
                'bookmark',
                {
                    keyPath: 'uid',
                    autoIncrement: true,
                },
            )
            bookmark.createIndex('id', 'id', { unique: true })
            bookmark.createIndex('url', 'url', { unique: false })
            bookmark.createIndex('type', 'type', { unique: false })
        }
    }

    public ready(callback: () => void) {
        if (!Abs_Database.DATABASE) {
            this.readyCallback = callback
        } else {
            callback()
        }
        return this
    }

    abstract getAll(
        key: unknown,
        callback: (result: T_Stores[T][]) => void,
    ): void
    abstract get(key: unknown, callback: (result: T_Stores[T]) => void): void
    abstract add(item: T_Stores[T]): void
    abstract update(
        item: T_Stores[T],
        callback?: (result: boolean) => void,
    ): void
    abstract update(
        item: T_Stores[T],
        callback: (result: boolean) => void,
    ): void
    abstract remove(key: unknown, callback?: (result: boolean) => void): void
    abstract remove(key: unknown, callback: (result: boolean) => void): void

    protected getStore(
        mode: 'readonly' | 'readwrite' | 'versionchange' = 'readonly',
    ): IDBObjectStore | undefined {
        // 🤬 DB does not exist
        if (!Abs_Database.DATABASE) return

        const transaction = Abs_Database.DATABASE.transaction(this.STORE, mode)
        return transaction.objectStore(this.STORE)
    }
}
