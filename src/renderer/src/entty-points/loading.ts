import { A_Entry } from '@src/renderer/src/entty-points/abs-entry'
/* Utils */
import { checkElectron } from '@src/renderer/src/utils'

class Cleaner extends A_Entry {}

document.addEventListener('DOMContentLoaded', () => {
    checkElectron()
    new Cleaner()
})
