import { Home } from '@home/modules/pages/home'

import { PageType } from '@src/types'

export class Address extends Home {
    public readonly page = PageType.ADDRESS

    cbInfoUpdated(): void {
        super.cbInfoUpdated()
        this.focus()
    }
}
