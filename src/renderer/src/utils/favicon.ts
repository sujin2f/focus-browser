/* Models */
import { Logger } from '@home/utils/logger'
/* Utils */
import { getSafeUrl } from '@src/common/utils/common'

type T_Favicon = {
    host: string
    image: string
    timestamp: number
    bookmarked?: boolean
}

export class Favicon {
    private readonly DB_NAME = 'focus'
    private readonly VERSION = 1
    private readonly STORE = {
        FAVICON: 'favicon',
    }
    private database?: IDBDatabase

    constructor() {
        const request = window.indexedDB.open(this.DB_NAME, this.VERSION)
        request.onerror = () =>
            Logger.getInstance().error('Error loading database.')

        request.onsuccess = () => {
            this.database = request.result
        }

        request.onupgradeneeded = (e) => {
            const database = (e.target as IDBOpenDBRequest).result
            if (!database) return
            this.database = database

            const favicon = this.database.createObjectStore(
                this.STORE.FAVICON,
                {
                    keyPath: 'host',
                },
            )

            favicon.createIndex('timestamp', 'timestamp', { unique: false })
        }
    }

    public get(_url: string, callback: (result?: T_Favicon) => void) {
        const url = getSafeUrl(_url)
        if (!url) return
        if (!this.database) return

        const transaction = this.database.transaction(this.STORE.FAVICON)
        const store = transaction.objectStore(this.STORE.FAVICON)

        const request = store.get(IDBKeyRange.only(url.hostname))
        request.onsuccess = async () => {
            callback(request.result)
        }
        request.onerror = () => {
            Logger.getInstance().error('indexedDB::get() request.onerror')
            callback()
        }
    }

    public set(host: string, image: string) {
        Logger.getInstance().info(`indexedDB::set(${host}, ${image})`)
        if (!this.database) return
        const timestamp = Math.round(new Date().getTime() / 1000)
        const transaction = this.database.transaction(
            this.STORE.FAVICON,
            'readwrite',
        )
        const store = transaction.objectStore(this.STORE.FAVICON)
        const query = store.add({ host, image, timestamp })
        query.onsuccess = () => {
            Logger.getInstance().info('indexedDB::set() done')
        }
        query.onerror = () => {
            Logger.getInstance().info('indexedDB::set() fail')
        }
    }

    public update(favicon: T_Favicon) {
        Logger.getInstance().info('indexedDB::update()', favicon)
        if (!this.database) return

        this.get(favicon.host, (favicon) => {
            const timestamp = Math.round(new Date().getTime() / 1000)
            const transaction = this.database!.transaction(
                this.STORE.FAVICON,
                'readwrite',
            )
            const store = transaction.objectStore(this.STORE.FAVICON)
            const query = store.put({ ...favicon, timestamp })
            query.onsuccess = () => {
                Logger.getInstance().info('indexedDB::update() done')
            }
        })
    }
}
