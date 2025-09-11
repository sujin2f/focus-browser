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
        this.data.bookmarks.unshift(bookmark)
    }

    remove(index: number) {
        this.data.bookmarks.splice(index, 1)
    }
}
