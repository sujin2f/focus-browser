import { PageType, TableAction, PageMode } from '@src/types'
import { navigate } from '@home/util'

export abstract class A_Page {
    /**
     * Identifier
     */
    abstract readonly page: PageType

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
    abstract cbInfoUpdated(): void

    protected get root() {
        return document.getElementById('root')
    }

    /**
     * For additional actions
     */
    public action(action: TableAction, ...arg: unknown[]) {
        if (action === TableAction.INFO) {
            this.cbInfoUpdated()
        }
    }

    /**
     * Shortcut
     */
    public doShortcut(e: KeyboardEvent): boolean {
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
}
