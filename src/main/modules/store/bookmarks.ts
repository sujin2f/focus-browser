import crypto from 'crypto'

import { Store } from '@main/modules/store/store'
import { Logger } from '@src/common/logger'
/* T_Types */
import type { T_Bookmark } from '@src/common/types'

export class Bookmarks extends Store<{ bookmarks: T_Bookmark[] }> {
    static instance: Bookmarks
    static getInstance(): Bookmarks {
        if (!Bookmarks.instance) {
            Bookmarks.instance = new Bookmarks('bookmarks', { bookmarks: [] })
            Bookmarks.instance.parse()
        }
        return Bookmarks.instance
    }

    private get bookmarkIndex() {
        for (let i = 0; i < this._data.bookmarks.length; i++) {
            if (this._data.bookmarks[i].url) {
                return i
            }
        }
        return NaN
    }

    get() {
        return super.get('bookmarks')
    }

    update(value: T_Bookmark) {
        for (const [index, bookmark] of this._data.bookmarks.entries()) {
            if (bookmark.id === value.id) {
                this._data.bookmarks[index] = value

                Logger.getInstance().log(
                    'Bookmark edited from: ',
                    bookmark,
                    ' to: ',
                    value,
                )
                return
            }
        }
    }

    /**
     * Add bookmark into index 0
     * @param bookmark
     * @returns
     */
    push(bookmark: T_Bookmark): string {
        bookmark.id = crypto.randomUUID().toString()

        // Directory
        if (!bookmark.url) {
            this._data.bookmarks.unshift(bookmark)
            return bookmark.id
        }

        // URL duplicated
        for (const item of this._data.bookmarks) {
            if (item.url === bookmark.url) {
                return item.id
            }
        }

        // Empty list
        if (isNaN(this.bookmarkIndex)) {
            // Empty
            this._data.bookmarks.unshift(bookmark)
            return bookmark.id
        }

        // Insert after Directories
        this._data.bookmarks.splice(this.bookmarkIndex, 0, bookmark)
        return bookmark.id
    }

    remove(index: number) {
        this._data.bookmarks.splice(index, 1)
    }

    parse() {
        super.parse()
        this._data.bookmarks.forEach((bookmark) => {
            if (!bookmark.id) {
                bookmark.id = crypto.randomUUID().toString()
            }
        })
    }
}
