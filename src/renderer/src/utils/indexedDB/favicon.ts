/* Models */
import { Abs_Database } from '@home/utils/indexedDB/abs-database'
import { Logger } from '@home/utils/logger'
/* Utils */
import { getSafeUrl } from '@src/common/utils/common'
/* T_Types */
import type { T_Favicon } from '@src/common/types/store'

export class Favicon extends Abs_Database<'favicon'> {
    protected readonly STORE = 'favicon'

    public get(_url: string, callback: (result: T_Favicon) => void) {
        const url = getSafeUrl(_url)
        // 🤬 URL is not valid
        if (!url) return

        const store = this.getStore()
        // 🤬 DB does not exist
        if (!store) return

        const request = store.get(url.hostname)
        request.onsuccess = async () => {
            callback(request.result)
        }
        request.onerror = () => {
            Logger.getInstance().error('indexedDB::get() request.onerror')
        }
    }

    public add(favicon: T_Favicon) {
        Logger.getInstance().info(`indexedDB::set(${favicon.host})`)
        const store = this.getStore('readwrite')
        // 🤬 DB does not exist
        if (!store) return

        const timestamp = Math.round(new Date().getTime() / 1000)
        const query = store.add({ ...favicon, timestamp })
        query.onsuccess = () => {
            Logger.getInstance().info('indexedDB::set() done')
        }
        query.onerror = () => {
            Logger.getInstance().info('indexedDB::set() fail')
        }
    }

    public update(favicon: T_Favicon) {
        Logger.getInstance().info('indexedDB::update()', favicon)
        const store = this.getStore('readwrite')
        // 🤬 DB does not exist
        if (!store) return

        this.get(favicon.host, (favicon) => {
            const timestamp = Math.round(new Date().getTime() / 1000)
            const query = store.put({ ...favicon, timestamp })
            query.onsuccess = () => {
                Logger.getInstance().info('indexedDB::update() done')
            }
        })
    }

    public getAll() {
        throw new Error('Invalid access')
    }

    public remove(_: unknown): void {}
}
