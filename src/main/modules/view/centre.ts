/* CONSTANTS */
import { CENTRE_PAGES, REQUEST_HANDLER } from '@src/common/constants'
/* Utils */
import { resolveHtmlPath } from '@src/common/utils/fs'
import { paths } from '@src/common/utils/fs'
/* T_Types */
import type { T_IPC_Message } from '@src/common/types'
/* Models */
import { AbsContentsView } from '@src/main/modules/view/abs-content-view'

export class CenterView extends AbsContentsView {
    public set scene(scene: CENTRE_PAGES) {
        switch (scene) {
            case CENTRE_PAGES.WELCOME:
                this.loadURL(CENTRE_PAGES.WELCOME)
                return
            case CENTRE_PAGES.HOME:
                this.loadURL(CENTRE_PAGES.HOME)
                return
            case CENTRE_PAGES.ADDRESS:
                this.loadURL(CENTRE_PAGES.HOME, 'address=true')
                return
            case CENTRE_PAGES.BOOKMARK:
                this.loadURL(CENTRE_PAGES.BOOKMARK)
                return
            case CENTRE_PAGES.ANCHOR:
                this.loadURL(CENTRE_PAGES.ANCHOR)
                return
            case CENTRE_PAGES.POPUP_BLOCKER:
                this.loadURL(CENTRE_PAGES.POPUP_BLOCKER)
                return
            case CENTRE_PAGES.OFFLINE:
                this.loadURL(CENTRE_PAGES.OFFLINE)
                return
            default:
                this.loadURL(CENTRE_PAGES.HOME)
        }
    }

    constructor() {
        super({
            webPreferences: {
                preload: paths.preload,
            },
        })
        this.scene = CENTRE_PAGES.WELCOME
    }

    public send<T extends keyof T_IPC_Message>(
        channel: T,
        handler: REQUEST_HANDLER,
        arg?: T_IPC_Message[T],
    ) {
        this.webContents.send(channel, handler, arg)
    }

    private loadURL(scene: string, _attrs: string = '') {
        const attrs = _attrs ? `?${_attrs}` : ''
        this.webContents.loadURL(resolveHtmlPath(scene) + attrs)
    }
}
