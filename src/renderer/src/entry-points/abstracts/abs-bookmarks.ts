import { A_List } from '@src/renderer/src/entry-points/abstracts/abs-list'
/* Utils */
import {
    ipcRenderer,
    navigate,
    // getSection,
    tagNameIs,
} from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { ListItem } from '@src/renderer/src/template-parts/list-item'
/* CONSTANTS */
import { IPC_CHANNELS, RequestHandler } from '@src/common/constants'
/* T_Types */
import type { T_Bookmark } from '@src/common/types'

type T_Dir = {
    data: T_Bookmark
    isHidden: boolean
    dir: ListItem[]
    items: ListItem[]
}
export abstract class A_Bookmarks extends A_List<T_Bookmark> {
    protected dirs: Record<string, T_Dir> = {}

    constructor(css: string = '') {
        super(css)
        this.request()
    }

    protected request(): void {
        ipcRenderer.send(IPC_CHANNELS.BOOKMARK, RequestHandler.REQUEST)

        ipcRenderer.on(IPC_CHANNELS.BOOKMARK, (...args: unknown[]) => {
            const handler = args[0] as RequestHandler
            if (handler !== RequestHandler.RESPONSE) {
                return
            }
            this.callbackResponse(...args)
        })
    }

    protected callbackResponse(...args: unknown[]) {
        this.dirs = {}
        this.items = (args[1] as T_Bookmark[]).map((bookmark) => ({
            data: bookmark,
            items: [] as ListItem[],
        }))
        this.renderList()
    }

    renderList() {
        super.renderList()

        // Create & Assign ListItems
        this.items.forEach(({ data: bookmark, items }, index) => {
            const isDir = !bookmark.url
            const cols: ListItem[] = this.getListCols(bookmark, index)

            if (isDir) {
                // Dir: Store dir attributes
                if (!this.dirs[bookmark.id]) {
                    this.dirs[bookmark.id] = {
                        data: bookmark,
                        isHidden: true,
                        dir: [],
                        items: [],
                    }
                }
                cols.forEach((col) => this.dirs[bookmark.id].dir.unshift(col))
            } else if (bookmark.parent && this.dirs[bookmark.parent!]) {
                // Child: Store dir attributes
                cols.forEach((col) =>
                    this.dirs[bookmark.parent!].items.unshift(col),
                )
            } else {
                // Append
                this.items[index].data.parent = undefined
                cols.forEach((col) => col.appendTo(this.list.element))
            }

            items.push(...cols)
        })

        // Append from this.dirs
        const reversedDir = Object.keys(this.dirs).reverse()
        reversedDir.forEach((dirKey) => {
            this.dirs[dirKey].items.forEach((item) => {
                item.prependTo(this.list.element)
                item.hide()
            })
            this.dirs[dirKey].dir.forEach((item) => {
                item.prependTo(this.list.element)
            })
        })

        // Folder Action
        Object.keys(this.dirs).forEach((dirKey) => {
            const { dir, data } = this.dirs[dirKey]
            dir.forEach((item) => {
                item.setOnClick(() => this.onFolderClick(data.id))
            })
        })
    }

    private onFolderClick = (id: string) => {
        const isHidden = this.dirs[id].isHidden
        const folderIndex = this.dirs[id].dir.length - 1
        this.dirs[id].dir[folderIndex].title = isHidden ? '📂' : '📁'

        this.dirs[id].items.forEach((item) => {
            if (isHidden) {
                item.show()
            } else {
                item.hide()
            }
        })
        this.dirs[id].isHidden = !isHidden
    }

    protected getListCols(bookmark: T_Bookmark, _: number) {
        const isDir = !bookmark.url
        const icon = new ListItem(
            isDir
                ? '📁'
                : bookmark.parent && this.dirs[bookmark.parent]
                  ? '⋯'
                  : '',
        )
        const row = new ListItem(bookmark.title, bookmark.url).setOnClick(
            (e: PointerEvent) => {
                if (isDir || tagNameIs(e.target, 'button')) {
                    return
                }
                navigate(bookmark.url)
            },
        )
        return [icon, row]
    }
}
