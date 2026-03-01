/* Models */
import { Anchors } from '@main/store/anchors'
import { fetchFavicon } from '@src/common/utils/common'

export const getAnchors = (path: string) => {
    const store = new Anchors(path)
    process.parentPort.postMessage(store.get())
}

export const removeAnchor = (path: string, url: string) => {
    const store = new Anchors(path)
    store.remove(url)
    store.save()
    process.parentPort.postMessage(null)
}

export const addAnchor = async (path: string, url: string, title: string) => {
    const favicon = await fetchFavicon(url)
    const store = new Anchors(path)
    const result = store.push(url, title, favicon)
    store.save()
    process.parentPort.postMessage(result)
}

export const clearAnchor = (path: string) => {
    const store = new Anchors(path)
    store.clear()
    store.save()
    process.parentPort.postMessage(null)
}
