// import { Element } from '@home/modules/fragments'
import { PageType, TableAction, PageMode } from '@src/constants'
import { navigate } from '@home/util'

export abstract class A_Page {
    /**
     * Identifier
     */
    abstract readonly page: PageType

    /**
     * Page Layout
     *
     * <div id="root">
     *     <section.title>
     *         <title />
     *         <button to browser />
     *     </section.title>
     *     <section.container />
     * </div>
     */
    protected get root() {
        return document.getElementById('root')
    }
    // protected title = new Element('section')

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public action(action: TableAction, ...arg: unknown[]) {
        if (action === TableAction.INFO) {
            this.refresh()
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
