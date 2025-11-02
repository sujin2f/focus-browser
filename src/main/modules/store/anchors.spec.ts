import { electron } from '@test/mock-electron'
import { fs, readMock } from '@test/mock-fs'

jest.resetModules()
jest.doMock('electron', electron)
jest.doMock('fs', fs)
readMock.mockReturnValue({
    anchors: [
        { url: '0', title: '0' },
        { url: '1', title: '1' },
    ],
})

import { Anchors } from '@main/modules/store/anchors'

describe('Anchors store (module)', () => {
    test('singleton exists and push calls fs.writeFileSync', () => {
        const anchors = Anchors.getInstance()

        // Get
        expect(anchors.get()).toStrictEqual([
            { url: '0', title: '0' },
            { url: '1', title: '1' },
        ])

        // Push
        anchors.push({ url: '-1', title: '-1' })
        expect(anchors.get()[0]).toStrictEqual({ url: '-1', title: '-1' })

        // Remove
        anchors.remove('0')
        expect(anchors.get()).toStrictEqual([
            { url: '-1', title: '-1' },
            { url: '1', title: '1' },
        ])
    })
})
