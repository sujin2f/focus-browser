import { electron } from '@test/mock-electron'
import { fs, readMock } from '@test/mock-fs'

jest.resetModules()
jest.doMock('electron', electron)
jest.doMock('fs', fs)
readMock.mockReturnValue({
    bookmarks: [
        { url: '0', title: '0' },
        { url: '1', title: '1' },
    ],
})

import { Bookmarks } from '@main/modules/store/bookmarks'

describe('Bookmarks store (module)', () => {
    test('singleton exists and push persists bookmark', () => {
        const bookmarks = Bookmarks.getInstance()

        // Get
        expect(bookmarks.get()).toStrictEqual([
            { url: '0', title: '0' },
            { url: '1', title: '1' },
        ])

        // Push
        bookmarks.push({ url: '-1', title: '-1' })
        expect(bookmarks.get()[0]).toStrictEqual({ url: '-1', title: '-1' })

        // Update
        bookmarks.update(1, { url: 'updated', title: 'updated' })
        expect(bookmarks.get()).toStrictEqual([
            { url: '-1', title: '-1' },
            { url: 'updated', title: 'updated' },
            { url: '1', title: '1' },
        ])

        // Remove
        bookmarks.remove(1)
        expect(bookmarks.get()).toStrictEqual([
            { url: '-1', title: '-1' },
            { url: '1', title: '1' },
        ])
    })
})
