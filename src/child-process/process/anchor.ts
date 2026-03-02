/* Models */
import { Anchors } from '@main/store/anchors'

/**
 * @deprecated
 */
export const getAnchors = (path: string) => {
    const store = new Anchors(path)
    process.parentPort.postMessage(
        store
            .get()
            .filter((item) => item.title && item.url)
            .map((item) => ({ ...item, type: 'anchor' })),
    )
}
