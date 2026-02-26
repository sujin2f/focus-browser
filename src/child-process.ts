import { net } from 'electron'
/* Utils */
import { getDirectorySize, removeDirectory } from '@src/common/utils/fs'
/* CONSTANTS */
import { SUJINC_URL } from '@src/common/constants'
/* T_Types */
import type { T_Cloud_Item } from '@src/common/types'

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

        case 'upload-cloud-item':
            uploadCloudItem(e.data.item, e.data.machineId, e.data.token)
            return

        case 'remove-cloud-item':
            removeCloudItem(e.data._id, e.data.token)
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
            const body =
                response.status === 404
                    ? { error: `You don't have anything in the cloud.` }
                    : await response.json()
            process.parentPort.postMessage({ status: response.status, body })
        })
        .catch((e) => {
            process.parentPort.postMessage({
                status: 400,
                body: { error: e.message },
            })
        })
}

const uploadCloudItem = async (
    item: T_Cloud_Item,
    machineId: string,
    token: string,
) => {
    if (!item.message || !item.key || !item.title || !item.type) {
        process.parentPort.postMessage({
            status: 404,
            body: { error: 'The request is not valid.' },
        })
        return
    }
    const os = process.platform === 'darwin' ? 'mac' : process.platform
    const version = process.getSystemVersion()
    const message = Buffer.from(item.message, 'utf8').toString('base64')

    await net
        .fetch(`${SUJINC_URL}/focus/item`, {
            body: JSON.stringify({
                ...item,
                device: `${os}(${version})`,
                machineId,
                message,
            } satisfies T_Cloud_Item),
            method: 'PUT',
            headers: { authorization: `Bearer ${token}` },
        })
        .then(async (response) => {
            const body = await response.json()
            process.parentPort.postMessage({ status: response.status, body })
        })
        .catch((e) => {
            process.parentPort.postMessage({
                status: 404,
                body: { error: e.message },
            })
        })
}

const removeCloudItem = async (_id: string, token: string) => {
    await net
        .fetch(`${SUJINC_URL}/focus/item`, {
            method: 'DELETE',
            body: JSON.stringify({ _id }),
            headers: { authorization: `Bearer ${token}` },
        })
        .then(async (response) => {
            const body = await response.json()
            process.parentPort.postMessage({
                status: response.status,
                body: {
                    ...body,
                    id:
                        response.status === 200 || response.status === 404
                            ? _id
                            : '',
                },
            })
        })
        .catch((e) => {
            process.parentPort.postMessage({
                status: 404,
                body: { error: e.message },
            })
        })
}
