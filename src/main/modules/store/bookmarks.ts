import { randomUUID } from 'crypto'
/* Models */
import { Store } from '@main/modules/store/store'
/* T_Types */
import type { T_Bookmark, T_Bookmark_Store } from '@src/common/types'

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

    public update(value: T_Bookmark, isDir = false) {
        if (isDir && this.data.dirs[value.id]) {
            this.data.dirs[value.id] = value
            return
        }
        if (this.data.items[value.id]) {
            this.data.items[value.id] = value
        }
    }

    /**
     * Add bookmark / dir
     * @param bookmark
     * @returns
     */
    public push(bookmark: T_Bookmark, isDir = false): string | false {
        bookmark.id = randomUUID().toString()

        // Directory
        if (isDir) {
            this._data.dirs = {
                ...this._data.dirs,
                [bookmark.id]: bookmark,
            }
            return bookmark.id
        }

        // URL duplicated
        for (const item of this.items) {
            if (item.url === bookmark.url) {
                return false
            }
        }

        this._data.items = {
            [bookmark.id]: bookmark,
            ...this._data.items,
        }
        return bookmark.id
    }

    public remove(id: string) {
        const dir = this.data.dirs[id]
        if (dir) {
            delete this.data.dirs[id]
            this.items.forEach((bookmark) => delete bookmark.parent)
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
