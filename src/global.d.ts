import type { ElectronHandler } from '@src/preload'

declare global {
    const envVersion: string
    const envBeta: string
    const envDev: boolean
    interface Window {
        electron: ElectronHandler
    }
}

declare module '*.css'
