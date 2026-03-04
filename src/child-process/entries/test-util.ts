import { utilityProcess } from 'electron'
/* Utils */
import { paths } from '@src/common/utils/fs'
/* Models */
import { Logger } from '@src/common/logger'

export const test = () => {
    const child = utilityProcess.fork(paths.childProcess)
    child.postMessage({ channel: 'test' })
    child.once('message', (message) => {
        Logger.init().info('👶', 'Test', message)
        child.kill()
    })
}
