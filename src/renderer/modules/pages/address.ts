import { Home } from '@home/modules/pages/home'

import { PageType } from '@src/constants'

export class Address extends Home {
    public readonly page = PageType.ADDRESS

    refresh(): void {
        super.refresh()
        this.focus()
    }
}
