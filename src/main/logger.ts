import { isBeta, isDev, isTest } from '@src/common/utils'

interface I_Logger {
    error(...params: unknown[]): void
    warn(...params: unknown[]): void
    info(...params: unknown[]): void
    log(...params: unknown[]): void
    initialize(): void
}

/**
 * on Linux: ~/.config/{app name}/logs/main.log
 * on macOS: ~/Library/Logs/{app name}/main.log
 * on Windows: %USERPROFILE%\AppData\Roaming\{app name}\logs\main.log
 */
export class Logger {
    // Singleton instance
    static instance: Logger
    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger()
        }
        return Logger.instance
    }

    private logger: I_Logger = {
        error: (..._: unknown[]) => {},
        warn: (..._: unknown[]) => {},
        info: (..._: unknown[]) => {},
        log: (..._: unknown[]) => {},
        initialize: () => {},
    }

    private isActive: boolean = false

    constructor() {
        if (isDev() || (isBeta() && !isTest())) {
            import('electron-log')
                .then((logger) => {
                    this.logger = logger.default
                    this.logger.initialize()
                    this.isActive = true
                })
                .catch((error) => {
                    console.error('Loading electron-log failed:', error)
                })
        }
    }

    error(...params: unknown[]) {
        if (!this.isActive) {
            return
        }
        this.logger.error('🤬', ...params)
    }

    warn(...params: unknown[]) {
        if (!this.isActive) {
            return
        }
        this.logger.warn('⚠️', ...params)
    }

    log(...params: unknown[]) {
        if (!this.isActive) {
            return
        }
        this.logger.log('⭐️', ...params)
    }

    info(...params: unknown[]) {
        if (!this.isActive) {
            return
        }
        this.logger.info('👀', ...params)
    }
}
