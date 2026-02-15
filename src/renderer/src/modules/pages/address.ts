import { Home } from '@src/renderer/src/modules/pages/home'

import { CENTRE_PAGES } from '@src/common/constants'

export class Address extends Home {
    public readonly page = CENTRE_PAGES.ADDRESS

    refresh(): void {
        super.refresh()
        this.focus()
    }
}
