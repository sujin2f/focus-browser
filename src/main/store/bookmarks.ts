import { randomUUID } from 'crypto'
/* Models */
import { Store } from '@main/store/store'
/* T_Types */
import type { T_Bookmark, T_Bookmark_Store } from '@src/common/types'
import { getSafeUrl } from '@src/common/utils/common'

type T_Store = T_Bookmark_Store & {
    version: number
}
export class Bookmarks extends Store<T_Store> {
    protected fileName = 'bookmarks'
    protected defaults = { version: 1, dirs: {}, items: {} }

    constructor(path?: string) {
        super(path)
        this.migrate()
    }

    get<K extends keyof T_Bookmark_Store>(key: K): T_Bookmark_Store[K] {
        return this.data[key]
    }

    public update(bookmark: T_Bookmark, isDir = false): T_Bookmark | false {
        // 🤬 Title is empty
        if (!bookmark.title) return false

        bookmark.title = bookmark.title.trim()

        if (isDir) {
            // 🤬 Directory Not exist
            if (!this.data.dirs[bookmark.id]) return false
            this.data.dirs[bookmark.id] = bookmark
            return bookmark
        }

        // 🤬 URL is invalid
        const url = getSafeUrl(bookmark.url)
        if (!url) return false

        // 🤬 Not exist
        if (!this.data.items[bookmark.id]) return false

        this.data.items[bookmark.id] = { ...bookmark, url: url.toString() }
        return { ...bookmark, url: url.toString() }
    }

    /**
     * Add bookmark / dir
     * @param bookmark
     * @returns
     */
    public push(bookmark: T_Bookmark, isDir = false): T_Bookmark | false {
        // 🤬 Title is empty
        if (!bookmark.title) return false

        bookmark.id = randomUUID().toString()
        bookmark.title = bookmark.title.trim()

        // Directory
        if (isDir) {
            this.data.dirs = {
                ...this.data.dirs,
                [bookmark.id]: bookmark,
            }
            return bookmark
        }

        // 🤬 URL is invalid
        const url = getSafeUrl(bookmark.url)
        if (!url) return false

        // 🤬 URL duplicated
        for (const item of Object.values(this.data.items)) {
            if (item.url === bookmark.url) return false
        }

        this.data.items = {
            [bookmark.id]: { ...bookmark, url: url.toString() },
            ...this.data.items,
        }
        return { ...bookmark, url: url.toString() }
    }

    public remove(id: string, isDir = false) {
        if (isDir) {
            delete this.data.dirs[id]
            Object.values(this.data.items).forEach((bookmark) => {
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

        // 🤬 File is empty
        if (!fileContent) {
            this.data = this.defaults
            return
        }

        let data = JSON.parse(fileContent)
        // 😃 Current version
        if (data.version === this.defaults) {
            this.data = data
            return
        }

        // Older than 1 => 1
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

        this.data = data
    }
}
