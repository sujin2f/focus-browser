import { Home } from '@src/renderer/src/modules/pages/home'

import { PageType } from '@src/common/constants'

export class Address extends Home {
    public readonly page = PageType.ADDRESS

    refresh(): void {
        super.refresh()
        this.focus()
    }
}
