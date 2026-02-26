import { getDirectorySize, removeDirectory } from '@src/common/utils/fs'

process.parentPort.once('message', (e) => {
    switch (e.data.channel) {
        case 'directory-size': {
            const size = getDirectorySize(e.data.path)
            process.parentPort.postMessage(size)
            return
        }

        case 'remove-directory': {
            removeDirectory(e.data.path)
            process.parentPort.postMessage(true)
            return
        }
    }
})
