import { type Rectangle } from 'electron'
import { randomUUID } from 'crypto'
/* Models */
import { Store } from '@main/store/store'
/* T_Types */
import type { T_Status_Props, T_Status_Store_Props } from '@src/common/types'
/* CONSTANTS */
import { DEFAULT_STATUS } from '@src/common/constants'

export class Status extends Store<T_Status_Store_Props> {
    static instance: Status
    static getInstance(): Status {
        if (!Status.instance) {
            Status.instance = new Status()
            Status.instance.parse()
        }
        return Status.instance
    }

    protected fileName = 'status'
    protected defaults = DEFAULT_STATUS

    set<K extends keyof T_Status_Store_Props>(
        key: K,
        value?: T_Status_Store_Props[K],
    ): void {
        if (!value) return
        this.data[key] = value
    }

    public getBounds(current: Partial<Rectangle> = {}): Rectangle {
        const bounds = {
            ...current,
            width: this.data.width,
            height: this.data.height,
        }
        if (!isNaN(this.data.x)) {
            bounds.x = this.data.x
        }
        if (!isNaN(this.data.y)) {
            bounds.y = this.data.y
        }
        return bounds as Rectangle
    }

    public merge(value: T_Status_Props) {
        // Exclude none-StatusProps
        const {
            /* eslint-disable @typescript-eslint/no-unused-vars */
            title,
            url,
            adBlockerStatus,
            /* eslint-enable @typescript-eslint/no-unused-vars */
            ...updates
        } = value
        this.data = {
            ...this.data,
            ...updates,
        }
    }

    public save() {
        // Remove unknown items
        Object.keys(this.data).forEach((key) => {
            if (!Object.hasOwn(DEFAULT_STATUS, key)) {
                delete (this.data as unknown as Record<string, string>)[key]
            }
        })
        super.save()
    }

    async parse() {
        super.parse()

        // Store unique machine ID
        if (this.data.machineId === 'N/A') {
            this.set('machineId', randomUUID().toString())
        }

        super.mergeDefault()
    }
}
