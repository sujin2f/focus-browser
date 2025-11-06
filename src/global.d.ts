import type { ElectronHandler } from '@src/preload'
import type { Controller } from '@home/modules/controller'

declare global {
    const version: string
    const isBeta: string
    interface Window {
        electron: ElectronHandler
        controller: Controller
    }
}

export {}
