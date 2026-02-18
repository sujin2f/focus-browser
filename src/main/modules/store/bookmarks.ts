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

    update(index: number, bookmark: T_Bookmark) {
        Logger.getInstance().log(
            'Bookmark edited from: ',
            this._data.bookmarks[index],
            ' to: ',
            bookmark,
        )
        this._data.bookmarks[index] = bookmark
    }

    /**
     * Add bookmark into index 0
     * @param bookmark
     * @returns
     */
    push(bookmark: T_Bookmark) {
        for (const item of this._data.bookmarks) {
            if (item.url === bookmark.url) {
                return false
            }
        }

        if (!bookmark.url) {
            // dir
            this._data.bookmarks.unshift(bookmark)
            return true
        }

        if (isNaN(this.bookmarkIndex)) {
            // Empty
            this._data.bookmarks.unshift(bookmark)
            return true
        }

        // After dirs
        this._data.bookmarks.splice(this.bookmarkIndex, 0, bookmark)
        return true
    }

    remove(index: number) {
        this._data.bookmarks.splice(index, 1)
    }
}
