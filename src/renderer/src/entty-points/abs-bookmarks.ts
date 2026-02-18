import { A_List } from './abs-list'
/* Utils */
import {
    ipcRenderer,
    navigate,
    getSection,
    tagNameIs,
} from '@src/renderer/src/utils'
/* <HTML template-part /> */
import { ListItem } from '@src/renderer/src/template-parts/list-item'
/* CONSTANTS */
import { IPC_CHANNELS, RequestHandler } from '@src/common/constants'
/* T_Types */
import type { T_Bookmark } from '@src/common/types'

export abstract class A_Bookmarks extends A_List<T_Bookmark> {
    private dirs: ListItem[][] = []

    constructor(css: string = '') {
        super(css)
        this.request()
    }

    private request(): void {
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
        this.items = args[1] as T_Bookmark[]
        this.listItems = this.items
        this.renderList()
    }

    renderList() {
        getSection('list').innerHTML = ''

        this.listItems.forEach((bookmark, index) => {
            const isDir = !bookmark.url
            const hasParent = bookmark.parent || bookmark.parent === 0
            const icon = new ListItem(isDir ? '📁' : hasParent ? '⋯' : '')
            const row = new ListItem(bookmark.title, bookmark.url)

            if (isDir) {
                if (!this.dirs[index]) {
                    this.dirs[index] = []
                }
                this.dirs[index].push(icon)
                this.dirs[index].push(row)
            } else if (hasParent) {
                this.dirs[bookmark.parent!].push(icon)
                this.dirs[bookmark.parent!].push(row)
            } else {
                icon.appendTo(this.list.element)
                row.appendTo(this.list.element)
            }

            row.setOnClick((e: PointerEvent) => {
                if (isDir || tagNameIs(e.target, 'button')) {
                    return
                }
                navigate(bookmark.url)
            })
        })

        const reversedDir = [...this.dirs].reverse()
        reversedDir.forEach((items) => {
            const reversedItems = [...items].reverse()
            reversedItems.forEach((item) => {
                item.prependTo(this.list.element)
            })
        })

        this.dirs.forEach((items) => {
            // Empty Folder
            if (items.length < 3) {
                return
            }

            const onFolderClick = () => {
                const isHidden = items[2].isHidden()
                items[0].title = isHidden ? '📂' : '📁'
                for (let i = 2; i < items.length; i++) {
                    if (isHidden) {
                        items[i].show()
                    } else {
                        items[i].hide()
                    }
                }
            }

            items[0].setOnClick(onFolderClick)
            items[1].setOnClick(onFolderClick)

            items.forEach((item, itemIndex) => {
                // Hide children by default
                if (itemIndex > 1) {
                    item.hide()
                }
            })
        })
    }
}
