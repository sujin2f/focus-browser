import { net } from 'electron'
/* CONSTANTS */
import { SUJINC_URL } from '@src/common/constants'
/* T_Types */
import type { T_Cloud_Item } from '@src/common/types'
import { base64decode, base64encode } from '@src/common/utils/security-electron'

export const fetchCloudItems = async (token: string, email: string) => {
    await net
        .fetch(`${SUJINC_URL}/focus/items`, {
            method: 'GET',
            headers: { authorization: `Bearer ${token}`, email },
        })
        .then(async (response) => {
            if (response.status === 404) {
                process.parentPort.postMessage({
                    status: 404,
                    body: { error: `You don't have anything in the cloud.` },
                })
                return
            }
            const body: { result: T_Cloud_Item[] } = await response.json()
            body.result = body.result
                .filter((item) => item.message)
                .map((item) => ({
                    ...item,
                    message: base64decode(item.message!),
                }))
            process.parentPort.postMessage({ status: response.status, body })
        })
        .catch((e) => {
            process.parentPort.postMessage({
                status: 400,
                body: { error: e.message },
            })
        })
}

export const uploadCloudItem = async (
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
    const message = base64encode(item.message)

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

export const removeCloudItem = async (_id: string, token: string) => {
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
