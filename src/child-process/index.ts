import { net } from 'electron'
/* Utils */
import { getDirectorySize, removeDirectory } from '@src/common/utils/fs'
import { base64decode, base64encode } from '@src/common/utils/security'
/* CONSTANTS */
import { REQUEST_HANDLER, SUJINC_URL } from '@src/common/constants'
/* T_Types */
import type {
    T_Bookmark,
    T_Bookmark_Store,
    T_Cloud_Item,
    T_IPC_Data,
} from '@src/common/types'
/* Models */
import { Bookmarks } from '@src/main/modules/store/bookmarks'

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

        case 'list-bookmark': {
            const store = new Bookmarks(e.data.path)
            process.parentPort.postMessage({
                dirs: store.get('dirs'),
                items: store.get('items'),
            } satisfies T_Bookmark_Store)
            return
        }

        case 'add-bookmark': {
            const { item, meta } = e.data.args as T_IPC_Data<T_Bookmark>
            addBookmark(e.data.path, item!, Boolean(meta))
            return
        }

        case 'update-bookmark': {
            const { item, meta } = e.data.args as T_IPC_Data<T_Bookmark>
            if (!item) {
                process.parentPort.postMessage(REQUEST_HANDLER.RESPONSE_FAIL)
                return
            }
            const isDir = Boolean(meta)
            const store = new Bookmarks(e.data.path)
            const result = store.update(item, Boolean(meta))
            store.save()

            const handler = !result
                ? REQUEST_HANDLER.RESPONSE_FAIL
                : REQUEST_HANDLER.RESPONSE_SUCCESS

            process.parentPort.postMessage({
                handler,
                item,
                meta: { isDir, action: 'updated' },
            })
            return
        }

        case 'remove-bookmark': {
            const { item, meta } = e.data.args as T_IPC_Data<T_Bookmark>
            if (!item || !item?.id) {
                process.parentPort.postMessage({
                    handler: REQUEST_HANDLER.RESPONSE_FAIL,
                })
                return
            }
            const isDir = Boolean(meta)
            const store = new Bookmarks(e.data.path)
            store.remove(item.id, isDir)
            store.save()
            process.parentPort.postMessage({
                handler: REQUEST_HANDLER.RESPONSE_SUCCESS,
                item,
                meta: { isDir, action: 'removed' },
            })
            return
        }

        case 'test': {
            console.log(net)
            // const userData = app.getPath('userData')
            // process.parentPort.postMessage(userData)
            return
        }
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

const addBookmark = (path: string, bookmark: T_Bookmark, isDir: boolean) => {
    if (bookmark.id === 'from-cloud') {
        bookmark = JSON.parse(base64decode(bookmark.title))
    }
    if (!bookmark) {
        process.parentPort.postMessage(REQUEST_HANDLER.RESPONSE_FAIL)
        return
    }

    const store = new Bookmarks(path)
    const result = store.push(bookmark, isDir)
    store.save()
    const handler = !result
        ? REQUEST_HANDLER.RESPONSE_FAIL
        : REQUEST_HANDLER.RESPONSE_SUCCESS

    process.parentPort.postMessage({
        handler,
        item: result,
        meta: { isDir, action: 'added' },
    })
}
