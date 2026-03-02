/* T_Types */
import type { T_Bookmark_Store } from '@src/common/types'
import type { T_Bookmark } from '@src/common/types/store'
import type { T_Dir, T_Items } from '@src/common/types'

export const callbackRequestBookmarks = (response: T_Bookmark_Store) => {
    const items: T_Items<T_Bookmark> = []
    const dirs: T_Dir<T_Bookmark> = {}

    Object.keys(response.dirs).forEach((id) => {
        const data = response.dirs[id] as unknown as T_Bookmark
        dirs[id] = {
            data,
            hidden: true,
            dir: [],
            items: [],
        }
    })

    Object.values(response.items).forEach((item) => {
        const data = item as unknown as T_Bookmark
        if (data.parent && !dirs[data.parent]) {
            delete data.parent
        }
        items.push({ data, items: [] })
    })

    return { dirs, items }
}

export const updateBookmarks = (
    items: T_Items<T_Bookmark>,
    dirs: T_Dir<T_Bookmark>,
) => {
    const itemsNew: Record<string, T_Bookmark> = {}
    const dirNew: Record<string, T_Bookmark> = {}
    Object.values(items).forEach((item) => (itemsNew[item.data.id] = item.data))
    Object.values(dirs).forEach((item) => (dirNew[item.data.id] = item.data))

    return callbackRequestBookmarks({ dirs: dirNew, items: itemsNew })
}
