import { type Rectangle } from 'electron'
import Store from './store'
import type { Info, StatusProps } from '@src/types'

export default class Status extends Store<StatusProps> {
    static instance: Status
    static getInstance(): Status {
        if (!Status.instance) {
            Status.instance = new Status('status', {
                width: 1024,
                height: 728,
                x: NaN,
                y: NaN,
                maxHistory: 200,
                welcome: true,
                helpText: true,
                adBlocker: true,
            })
            Status.instance.parse()
        }
        return Status.instance
    }

    public getNumber(key: string) {
        return (super.get(key) || NaN) as number
    }

    public setNumber(key: string, value: number) {
        super.set(key, value)
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
        const { shortcuts, ...newValue } = value
        this._data = {
            ...this._data,
            ...newValue,
        }
    }
}
