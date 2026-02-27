import { A_Entry } from '@home/entry-points/abstracts/abs-entry'
/* Utils */
import { checkElectron } from '@src/renderer/src/utils'

class Loading extends A_Entry {}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Loading()
})
