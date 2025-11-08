import type { ElectronHandler } from '@src/preload'

declare global {
    const envVersion: string
    const envBeta: string
    interface Window {
        electron: ElectronHandler
    }
}

export {}
