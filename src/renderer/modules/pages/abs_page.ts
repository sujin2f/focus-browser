import { Element } from '@home/modules/fragments'
import {
    PageType,
    TableAction,
    PageMode,
    Channel,
    RequestHandler,
} from '@src/common/constants'
import { ipcRenderer, navigate } from '@home/utils'
import { Root } from '../fragments/root'
import { Logger } from '@src/common/logger'
import { Info } from '@src/common/types'

export abstract class A_Page {
    /**
     * Identifier
     */
    abstract readonly page: PageType

    private _root: Element<HTMLElement>
    protected get root(): Element<HTMLElement> {
        if (!this._root) {
            this._root = new Root()
        }
        return this._root
    }

    /**
     * Modes like list, edit, find...
     */
    protected _mode: PageMode = PageMode.LIST
    protected changeMode(mode: PageMode): boolean {
        if (this._mode === mode) {
            return false
        }

        this._mode = mode
        return true
    }

    /**
     * Abstracts
     */
    abstract refresh(): void

    /**
     * For additional actions
     */
    public action(action: TableAction, ..._: unknown[]) {
        if (action === TableAction.INFO) {
            Logger.getInstance().log('Table action INFO is triggered')
            this.refresh()
        }
    }

    /**
     * Shortcut
     */
    public doShortcut(e: KeyboardEvent): boolean | 'findMode' {
        if (e.key === 'Escape') {
            // unFocus input
            if (document.activeElement.tagName.toLowerCase() === 'input') {
                this.blur()
                return true
            }

            // Back to List mode
            if (this._mode !== PageMode.LIST) {
                this.changeMode(PageMode.LIST)
                return
            }

            // Back to browser mode
            navigate()
            return true
        }

        return false
    }

    protected blur() {
        ;(document.activeElement as HTMLElement).blur()
    }

    protected settings: Partial<Info> = {}
    protected requestInfo(...keys: (keyof Info)[]) {
        Logger.getInstance().log(
            `[Renderer] requestInfo ${JSON.stringify(keys)}`,
        )
        ipcRenderer.once(
            Channel.INFO,
            (handler: RequestHandler, setting: Info) => {
                if (handler !== RequestHandler.RESPONSE) {
                    return
                }
                Logger.getInstance().info(
                    `[Renderer] Get Info ${JSON.stringify(setting)}`,
                )
                this.settings = { ...this.settings, ...setting }
                this.action(TableAction.INFO)
            },
        )
        ipcRenderer.send(Channel.INFO, RequestHandler.REQUEST, ...keys)
    }
}
