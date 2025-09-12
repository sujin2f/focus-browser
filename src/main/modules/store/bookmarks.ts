import { Notification } from 'electron'
import { Bookmark } from '@src/types'
import Store from './store'

export default class Bookmarks extends Store<{ bookmarks: Bookmark[] }> {
    static instance: Bookmarks
    static getInstance(): Bookmarks {
        if (!Bookmarks.instance) {
            Bookmarks.instance = new Bookmarks('bookmarks', { bookmarks: [] })
        }
        return Bookmarks.instance
    }

    get() {
        return this.data.bookmarks
    }

    edit(index: number, bookmark: Bookmark) {
        this.data.bookmarks[index] = bookmark
    }

    push(bookmark: Bookmark) {
        new Notification({
            title: 'Focus',
            body: 'New Bookmark Added',
            silent: true,
        }).show()
        this.data.bookmarks.unshift(bookmark)
    }

    remove(index: number) {
        this.data.bookmarks.splice(index, 1)
    }
}
