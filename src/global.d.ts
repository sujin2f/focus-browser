import type { ElectronHandler } from '@src/preload'

declare global {
    const envVersion: string
    const envBeta: string
    interface Window {
        electron: ElectronHandler
    }
}

declare module '*.css' {
    const classes: { [key: string]: string }
    export default classes
}

export {}
