import { isDebug } from '@main/util'

interface I_Logger {
    error(...params: any[]): void
    warn(...params: any[]): void
    info(...params: any[]): void
}

export default class Logger {
    // Singleton instance
    static instance: Logger
    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger()
        }
        return Logger.instance
    }
    private logger: I_Logger | null

    constructor() {
        if (isDebug) {
            import('electron-log')
                .then((logger) => {
                    logger.initialize()
                    this.logger = logger
                })
                .catch((err) =>
                    console.log(
                        'An error occurred to load electron-log: ',
                        err,
                    ),
                )
        }
    }

    error(...params: any[]) {
        if (!this.logger) {
            return
        }
        this.logger.error(...params)
    }

    warn(...params: any[]) {
        if (!this.logger) {
            return
        }
        this.logger.warn(...params)
    }

    info(...params: any[]) {
        if (!this.logger) {
            return
        }
        this.logger.info(...params)
    }
}
