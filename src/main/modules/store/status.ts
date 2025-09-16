import { type Rectangle } from 'electron'
import Store from './store'

type Props = {
    width: number
    height: number
    x: number
    y: number
    maxHistory: number
    welcome: boolean
}

export default class Status extends Store<Props> {
    constructor() {
        super('status', {
            width: 1024,
            height: 728,
            x: NaN,
            y: NaN,
            maxHistory: 200,
            welcome: true,
        })
        this.parse()
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
}
