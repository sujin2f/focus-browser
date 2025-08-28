import { Bookmark } from "../../../types";
import Store from "./store";

export default class Bookmarks extends Store<{ bookmarks: Bookmark[] }> {
    // Singleton instance
    static instance: Bookmarks;
    static getInstance(): Bookmarks {
        if (!Bookmarks.instance) {
            Bookmarks.instance = new Bookmarks('bookmarks', { bookmarks: [] });
        }
        return Bookmarks.instance;
    }

    get() {
        return this.data.bookmarks;
    }

    add(title: string, url: string, shortcut?: string) {
        const newBookmark: Bookmark = { url, title };
        if (shortcut) {
            newBookmark.shortcut = shortcut;
        }
        this.data.bookmarks.push(newBookmark);
        this.set();
    }

    remove(index: number) {
        this.data.bookmarks.splice(index, 1);
        this.set();
    }
}
