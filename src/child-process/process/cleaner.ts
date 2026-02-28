import { byteToSize } from '@src/common/utils/common'
import { getDirectorySize } from '@src/common/utils/fs'
import { Anchors } from '@src/main/store/anchors'
import { PopupBlocker } from '@src/main/store/popup-blocker'

export const getCleanerData = (_indexedDB: string, userData: string) => {
    const indexedDB = getDirectorySize(_indexedDB)
    const anchors = Object.keys(new Anchors(userData).get()).length.toString()
    const popup = PopupBlocker.getInstance(userData).get('blocked')

    process.parentPort.postMessage({
        indexedDB: byteToSize(indexedDB),
        popup: Array.from(popup).length.toString(),
        anchors,
    })
}
