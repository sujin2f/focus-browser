import { WebContentsView, type Rectangle } from 'electron'
/* CONSTANTS */
import { IPC_CHANNELS, REQUEST_HANDLER } from '@src/common/constants'
/* Utils */
import { resolveHtmlPath } from '@src/common/utils/fs'
import { paths } from '@src/common/utils/fs'
/* Models */
import { Logger } from '@main/lib/logger'

export class FindView extends WebContentsView {
    public keyword = ''

    constructor() {
        super({
            webPreferences: {
                preload: paths.preload,
                transparent: true,
            },
        })

        this.webContents.loadURL(resolveHtmlPath('find.html'))
    }

    public resize(bounds: Rectangle) {
        this.setBounds({ x: bounds.width - 420, y: 5, width: 400, height: 50 })
    }

    public focus() {
        Logger.getInstance().log(`FindView::focus()`)
        this.webContents.send(IPC_CHANNELS.FIND, REQUEST_HANDLER.RESPONSE, {
            focus: true,
        })
        this.webContents.focus()
    }

    public reset() {
        Logger.getInstance().log(`FindView::reset()`)
        this.webContents.send(IPC_CHANNELS.FIND, REQUEST_HANDLER.RESPONSE, {
            reset: true,
        })
    }

    public setMatched(matches: number, activeMatchOrdinal: number) {
        Logger.getInstance().log(`FindView::setMatched()`)
        this.webContents.send(IPC_CHANNELS.FIND, REQUEST_HANDLER.RESPONSE, {
            matches,
            activeMatchOrdinal,
        })
    }
}
