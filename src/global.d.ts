import type { ElectronHandler } from '@src/preload'
import type { Controller } from '@home/modules/controller'

declare global {
    interface Window {
        electron: ElectronHandler
        controller: Controller
    }
}

export {}
