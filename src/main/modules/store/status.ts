import { type Rectangle } from 'electron'
import { Store } from '@main/modules/store/store'
import type { Info, StatusProps } from '@src/common/types'
import { DEFAULT_STATUS } from '@src/common/constants'

export class Status extends Store<StatusProps> {
    static instance: Status
    static getInstance(): Status {
        if (!Status.instance) {
            Status.instance = new Status('status', DEFAULT_STATUS)
            Status.instance.parse()
        }
        return Status.instance
    }

    public getBounds(current: Partial<Rectangle> = {}): Rectangle {
        const bounds = {
            ...current,
            width: this._data.width,
            height: this._data.height,
        }
        if (!isNaN(this._data.x)) {
            bounds.x = this._data.x
        }
        if (!isNaN(this._data.y)) {
            bounds.y = this._data.y
        }
        return bounds as Rectangle
    }

    public merge(value: Info) {
        // Exclude none-StatusProps
        const {
            /* eslint-disable @typescript-eslint/no-unused-vars */
            shortcuts,
            cacheSize,
            title,
            url,
            adBlockerStatus,
            /* eslint-enable @typescript-eslint/no-unused-vars */
            ...updates
        } = value
        this._data = {
            ...this._data,
            ...updates,
        }
    }
}
