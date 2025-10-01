import { Notification } from 'electron'
import { Bookmark } from '@src/types'
import Store from './store'

export default class Bookmarks extends Store<{ bookmarks: Bookmark[] }> {
    static instance: Bookmarks
    static getInstance(): Bookmarks {
        if (!Bookmarks.instance) {
            Bookmarks.instance = new Bookmarks('bookmarks', { bookmarks: [] })
            Bookmarks.instance.parse()
        }
        return Bookmarks.instance
    }

    get() {
        return this._data.bookmarks
    }

    edit(index: number, bookmark: Bookmark) {
        this._data.bookmarks[index] = bookmark
    }

    push(bookmark: Bookmark) {
        for (const item of this._data.bookmarks) {
            if (item.url === bookmark.url) {
                return
            }
        }

        new Notification({
            title: 'Focus',
            body: 'New Bookmark Added',
            silent: true,
        }).show()
        this._data.bookmarks.unshift(bookmark)
    }

    remove(index: number) {
        this._data.bookmarks.splice(index, 1)
    }
}
