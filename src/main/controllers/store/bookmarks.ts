import { Bookmark } from '@src/types'
import Store from './store'

export default class Bookmarks extends Store<{ bookmarks: Bookmark[] }> {
    // Singleton instance
    /* eslint-disable-next-line no-use-before-define */
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

    push(bookmark: Bookmark) {
        this.data.bookmarks.push(bookmark)
        this.save()
    }

    remove(index: number) {
        this.data.bookmarks.splice(index, 1)
        this.save()
    }
}
