import { randomUUID } from 'crypto'
/* Models */
import { Store } from '@main/modules/store/store'
/* T_Types */
import type { T_Bookmark, T_Bookmark_Store } from '@src/common/types'
import { getSafeUrl } from '@src/common/utils/common'

type T_Store = T_Bookmark_Store & {
    version: number
}

export class Bookmarks extends Store<T_Store> {
    protected fileName = 'bookmarks'
    protected defaults = { version: 1, dirs: {}, items: {} }

    public get dirs() {
        return Object.values(this.data.dirs)
    }

    public get items() {
        return Object.values(this.data.items)
    }

    public get ipc(): T_Bookmark_Store {
        return {
            dirs: this.data.dirs,
            items: this.data.items,
        }
    }

    constructor(path?: string) {
        super(path)
        this.migrate()
    }

    public update(bookmark: T_Bookmark, isDir = false): T_Bookmark | false {
        if (isDir && this.data.dirs[bookmark.id]) {
            this.data.dirs[bookmark.id] = bookmark
            return bookmark
        }

        // URL is invalid
        const url = getSafeUrl(bookmark.url)
        if (!url) {
            return false
        }

        if (this.data.items[bookmark.id]) {
            this.data.items[bookmark.id] = { ...bookmark, url: url.toString() }
            return { ...bookmark, url: url.toString() }
        }

        return false
    }

    /**
     * Add bookmark / dir
     * @param bookmark
     * @returns
     */
    public push(bookmark: T_Bookmark, isDir = false): T_Bookmark | false {
        bookmark.id = randomUUID().toString()

        // Directory
        if (isDir) {
            this._data.dirs = {
                ...this._data.dirs,
                [bookmark.id]: bookmark,
            }
            return bookmark
        }

        // URL is invalid
        const url = getSafeUrl(bookmark.url)
        if (!url) {
            return false
        }

        // URL duplicated
        for (const item of this.items) {
            if (item.url === bookmark.url) {
                return false
            }
        }

        this._data.items = {
            [bookmark.id]: { ...bookmark, url: url.toString() },
            ...this._data.items,
        }
        return { ...bookmark, url: url.toString() }
    }

    public remove(id: string, isDir = false) {
        if (isDir) {
            delete this.data.dirs[id]
            this.items.forEach((bookmark) => {
                if (bookmark.parent === id) {
                    delete bookmark.parent
                }
            })
            return
        }

        delete this.data.items[id]
    }

    public parse() {
        return
    }

    private migrate() {
        const fileContent = this.getFileContent()
        if (!fileContent) {
            this._data = this.defaults
            return
        }

        let data = JSON.parse(fileContent)

        if (!data.version) {
            const dirs = {} as Record<string, T_Bookmark>
            const items = {} as Record<string, T_Bookmark>
            const dirIndex = [] as string[]

            ;(data.bookmarks as T_Bookmark[])
                .filter((item) => !item.url)
                .forEach((item) => {
                    const id = item.id || randomUUID().toString()
                    dirIndex.push(id)
                    dirs[id] = { ...item, id } satisfies T_Bookmark
                })
            ;(data.bookmarks as T_Bookmark[])
                .filter((item) => item.url)
                .forEach((item) => {
                    const id = item.id || randomUUID().toString()
                    if (typeof item.parent === 'number') {
                        item.parent = dirIndex[item.parent]
                    }
                    items[id] = { ...item, id } satisfies T_Bookmark
                })

            data = {
                version: 1,
                dirs,
                items,
            } satisfies T_Store
        }

        this._data = data
    }
}
