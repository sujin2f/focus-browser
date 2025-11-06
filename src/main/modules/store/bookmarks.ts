import { Store } from '@main/modules/store/store'
import { Logger } from '@src/common/logger'
import type { Bookmark } from '@src/common/types'

export class Bookmarks extends Store<{ bookmarks: Bookmark[] }> {
    static instance: Bookmarks
    static getInstance(): Bookmarks {
        if (!Bookmarks.instance) {
            Bookmarks.instance = new Bookmarks('bookmarks', { bookmarks: [] })
            Bookmarks.instance.parse()
        }
        return Bookmarks.instance
    }

    get() {
        return super.get('bookmarks')
    }

    update(index: number, bookmark: Bookmark) {
        Logger.getInstance().log(
            'Bookmark edited from: ',
            this._data.bookmarks[index],
            ' to: ',
            bookmark,
        )
        this._data.bookmarks[index] = bookmark
    }

    push(bookmark: Bookmark) {
        for (const item of this._data.bookmarks) {
            if (item.url === bookmark.url) {
                return false
            }
        }

        this._data.bookmarks.unshift(bookmark)
        return true
    }

    remove(index: number) {
        this._data.bookmarks.splice(index, 1)
    }
}
