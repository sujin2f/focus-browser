import { PageType } from '@src/types'
import Home from './home'
import { isMac } from '@src/renderer/util'

export default class Address extends Home {
    public readonly page = PageType.ADDRESS

    render(): void {
        super.render()
        this.search.focus()
    }

    doShortcut(e: KeyboardEvent): boolean {
        if (
            e.key.toLowerCase() === 'l' &&
            ((isMac() && e.metaKey) || (!isMac() && e.ctrlKey))
        ) {
            this.search.focus()
            return
        }
        super.doShortcut(e)
    }
}
