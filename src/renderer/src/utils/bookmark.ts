/* T_Types */
import type { T_Bookmark, T_Bookmark_Store } from '@src/common/types'
/* <HTML template-part /> */
import { ListItem } from '@home/template-parts/list-item'

export const callbackRequestBookmarks = (response: T_Bookmark_Store) => {
    const items: { data: T_Bookmark; items: ListItem[] }[] = []
    const dirs: Record<
        string,
        {
            data: T_Bookmark
            hidden: boolean
            dir: ListItem[]
            items: ListItem[]
        }
    > = {}

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
