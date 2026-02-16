import { A_Entry } from '@src/renderer/src/entries/abs-entry'
import { checkElectron, navigate } from '@src/renderer/src/utils'
import { NAVIGATION } from '@src/common/constants'

import { H1 } from '@src/renderer/src/fragments/h1'
import { Card } from '@src/renderer/src/fragments/card'

class Dashboard extends A_Entry {
    private get grid() {
        const grid = document.querySelector<HTMLElement>('#grid')
        if (!grid) {
            throw new Error('No grid element exist')
        }
        return grid
    }

    constructor() {
        super()
        new H1('Welcome to Focus!').prepend(this.getSection('root'))
        new Card('🫰 Continue (Esc)', 'Visit the last page from your history')
            .append(this.grid)
            .setOnClick(() => {
                navigate(NAVIGATION.LAST_VISIT)
            })
        new Card('⚙️ Search Engine', 'Search Web')
            .append(this.grid)
            .setOnClick(() => {
                navigate(NAVIGATION.SEARCH_ENGINE)
            })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Dashboard()
})
