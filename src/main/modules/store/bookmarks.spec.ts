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
        expect(
            bookmarks.get().map((bookmark) => ({
                url: bookmark.url,
                title: bookmark.title,
            })),
        ).toStrictEqual([
            { url: '0', title: '0' },
            { url: '1', title: '1' },
        ])

        // Push
        const id = bookmarks.push({ id: '', url: '-1', title: '-1' })
        const bookmark = bookmarks.get()[0]
        expect({
            url: bookmark.url,
            title: bookmark.title,
        }).toStrictEqual({ url: '-1', title: '-1' })

        // Update
        bookmarks.update({ id, url: 'updated', title: 'updated' })

        expect(
            bookmarks.get().map((bookmark) => ({
                url: bookmark.url,
                title: bookmark.title,
            })),
        ).toStrictEqual([
            { url: 'updated', title: 'updated' },
            { url: '0', title: '0' },
            { url: '1', title: '1' },
        ])

        // Remove
        bookmarks.remove(1)
        expect(
            bookmarks.get().map((bookmark) => ({
                url: bookmark.url,
                title: bookmark.title,
            })),
        ).toStrictEqual([
            { url: 'updated', title: 'updated' },
            { url: '1', title: '1' },
        ])
    })
})
