import { Home } from '@home/modules/pages/home'

import { PageType } from '@src/types'
import { isMac } from '@src/renderer/util'

export class Address extends Home {
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
