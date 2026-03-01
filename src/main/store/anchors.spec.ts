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

import { Anchors } from '@main/store/anchors'

describe('⚓️ Anchors store (module)', () => {
    test('singleton exists and push calls fs.writeFileSync', () => {
        const anchors = new Anchors()

        // Get
        expect(anchors.get()).toStrictEqual([
            { url: '0', title: '0' },
            { url: '1', title: '1' },
        ])

        // Push
        anchors.push('test-url', 'test-title', 'test-favicon')
        expect(anchors.get()[0]).toStrictEqual({
            id: '',
            url: 'test-url',
            title: 'test-title',
            favicon: 'test-favicon',
        })

        // Remove
        anchors.remove('0')
        expect(anchors.get()).toStrictEqual([
            {
                id: '',
                url: 'test-url',
                title: 'test-title',
                favicon: 'test-favicon',
            },
            { url: '1', title: '1' },
        ])
    })
})
