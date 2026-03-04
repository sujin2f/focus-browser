import { randomUUID } from 'crypto'
/* Models */
import { Store } from '@main/store/store'
/* T_Types */
import type { T_Bookmark } from '@src/common/types/store'

type T_Bookmark_Store = {
    dirs: Record<string, T_Bookmark>
    items: Record<string, T_Bookmark>
}

type T_Store = T_Bookmark_Store & {
    version: number
}
/**
 * @deprecated moving to centre
 */
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
