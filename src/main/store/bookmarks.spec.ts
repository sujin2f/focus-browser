// yarn test bookmarks.spec.ts

import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'
import { electron } from '@test/mock-electron'

jest.resetModules()
jest.doMock('electron', electron)

import { Bookmarks } from '@main/store/bookmarks'

/**
 * @deprecated moving to centre
 */
describe('🔖 Bookmarks store (module)', () => {
    const file = path.join(os.tmpdir(), 'bookmarks.json')

    test('Migrate from initial version', () => {
        // Save old data
        const data = {
            bookmarks: [
                { title: 'dir' },
                { title: 'bm', url: 'url', parent: 0 },
            ],
        }
        fs.writeFileSync(file, JSON.stringify(data), {
            encoding: 'utf-8',
        })

        const bookmarks = new Bookmarks(os.tmpdir())
        const dirs = Object.values(bookmarks.get('dirs'))
        const items = Object.values(bookmarks.get('items'))

        expect(dirs[0].title).toBe('dir')
        expect(items[0].title).toBe('bm')
        expect(items[0].parent).toBe(dirs[0].id)
    })

    test('Migrate from version 0', () => {
        // Save old data
        const data = {
            bookmarks: [
                { id: 'a', title: 'dir' },
                { id: 'b', title: 'bm', url: 'url', parent: 'a' },
            ],
        }
        fs.writeFileSync(file, JSON.stringify(data), {
            encoding: 'utf-8',
        })

        const bookmarks = new Bookmarks(os.tmpdir())
        const dirs = Object.values(bookmarks.get('dirs'))
        const items = Object.values(bookmarks.get('items'))

        expect(dirs[0].title).toBe('dir')
        expect(items[0].title).toBe('bm')
        expect(items[0].parent).toBe(dirs[0].id)
    })
})
