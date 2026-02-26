import { net } from 'electron'
/* Models */
import { Logger } from '@main/logger'
/* Utils */
import { getDirectorySize, removeDirectory } from '@src/common/utils/fs'
/* CONSTANTS */
import { SUJINC_URL } from '@src/common/constants'

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

        case 'fetch-cloud-items':
            fetchCloudItems(e.data.token, e.data.email)
            return
    }
})

const fetchCloudItems = async (token: string, email: string) => {
    await net
        .fetch(`${SUJINC_URL}/focus/items`, {
            method: 'GET',
            headers: { authorization: `Bearer ${token}`, email },
        })
        .then(async (response) => {
            Logger.getInstance().log(
                `${SUJINC_URL}/focus/items responded with ${response.status}`,
            )
            const body = await response.json()
            process.parentPort.postMessage({ status: response.status, body })
        })
        .catch(() => {
            process.parentPort.postMessage({
                status: 400,
                body: { error: 'Failed to GET cloud messages.' },
            })
        })
}
