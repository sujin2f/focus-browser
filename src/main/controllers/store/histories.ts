import * as fs from 'fs'
import { Bookmark, I_History } from '@src/types'
import Store from './store'

export class History {
    private _prev: History | null
    private _next: History | null

    public url: string
    public title: string
    public shortcut: string

    public set prev(prev: History) {
        this._prev = prev
    }

    public set next(next: History) {
        this._next = next
    }

    public get prev() {
        return this._prev
    }

    public get next() {
        return this._next
    }

    constructor(
        public timestamp: number,
        bookmark: Bookmark,
    ) {
        this.url = bookmark.url
        this.title = bookmark.title
        this.shortcut = bookmark.shortcut
    }

    public toJSON() {
        return {
            url: this.url,
            title: this.title,
            shortcut: this.shortcut,
        }
    }
}

export default class Histories extends Store<I_History> {
    // Singleton instance
    /* eslint-disable-next-line no-use-before-define */
    static instance: Histories
    static getInstance(): Histories {
        if (!Histories.instance) {
            Histories.instance = new Histories('history', {})
        }
        return Histories.instance
    }

    public current: History | null

    back() {
        if (!this.current || !this.current.prev) {
            return
        }

        this.current = this.current.prev
        return this.current
    }

    forward() {
        if (!this.current || !this.current.next) {
            return
        }

        this.current = this.current.next
        return this.current
    }

    get() {
        return this.data
    }

    push(bookmark: Bookmark) {
        if (this.current && this.current.url === bookmark.url) {
            return
        }

        // Link
        const timestamp = new Date()
        const history = new History(timestamp.getTime(), bookmark)
        if (this.current) {
            this.current.next = history
            history.prev = this.current
        }
        this.current = history

        // this.data: from beginning to current
        let cursor = this.current
        let counts = 50 // Maximum storing

        this.data = {}
        while (cursor && counts > 0) {
            this.data[cursor.timestamp] = cursor.toJSON()
            cursor = cursor.prev
            counts--
        }
        this.set()
    }

    protected parse() {
        try {
            const histories = JSON.parse(
                fs.readFileSync(this.path, 'utf-8'),
            ) as I_History

            Object.keys(histories)
                .sort()
                .forEach((key) => {
                    const obj = new History(parseInt(key), histories[key])
                    if (this.current) {
                        this.current.next = obj
                    }

                    this.current = obj
                })

            return histories
        } catch (error) {
            // if there was some kind of error, return the passed in defaults instead.
            return this.defaults
        }
    }
}
