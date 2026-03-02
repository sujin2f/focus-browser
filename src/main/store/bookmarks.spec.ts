// yarn test bookmarks.spec.ts

import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'
import { electron } from '@test/mock-electron'

jest.resetModules()
jest.doMock('electron', electron)

import { Bookmarks } from '@main/store/bookmarks'
import type { T_Bookmark } from '@src/common/types/store'

/**
 * @deprecated moving to centre
 */
describe('🔖 Bookmarks store (module)', () => {
    const file = path.join(os.tmpdir(), 'bookmarks.json')
    const save = () => {
        const data = {
            version: 1,
            dirs: {
                a: { id: 'a', title: 'dir1' },
                b: { id: 'b', title: 'dir2' },
            },
            items: {
                c: { id: 'c', title: 'item1', url: 'url1', parent: 'a' },
                d: { id: 'd', title: 'item2', url: 'url2', parent: 'b' },
            },
        }
        fs.writeFileSync(file, JSON.stringify(data), {
            encoding: 'utf-8',
        })
    }

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

    test('😀 update()', () => {
        save()
        const bookmarks = new Bookmarks(os.tmpdir())
        const result1 = bookmarks.update(
            { id: 'a', title: 'changed' } as T_Bookmark,
            true,
        )
        const result2 = bookmarks.update({
            id: 'c',
            title: 'changed',
            url: 'http://google.com/2',
        } as T_Bookmark)

        const dirs = Object.values(bookmarks.get('dirs'))
        const items = Object.values(bookmarks.get('items'))

        expect(result1).toBeTruthy()
        expect(result2).toBeTruthy()
        expect(dirs).toStrictEqual([
            { id: 'a', title: 'changed' },
            { id: 'b', title: 'dir2' },
        ])
        expect(items).toStrictEqual([
            { id: 'c', title: 'changed', url: 'http://google.com/2' },
            { id: 'd', title: 'item2', url: 'url2', parent: 'b' },
        ])
    })

    test('🤬 update()', () => {
        save()
        const bookmarks = new Bookmarks(os.tmpdir())
        // URL is not valid
        const fail1 = bookmarks.update({
            id: 'c',
            title: 'changed',
            url: 'url',
        } as T_Bookmark)
        // title is empty
        const fail2 = bookmarks.update({
            id: 'c',
            title: '',
            url: 'http://google.com',
        } as T_Bookmark)
        // Not exits item doesn't change anything
        const fail3 = bookmarks.update({
            id: 'b',
            title: 'changed',
            url: 'http://google.com/3',
        } as T_Bookmark)

        expect(fail1).toBeFalsy()
        expect(fail2).toBeFalsy()
        expect(fail3).toBeFalsy()
    })

    test('😀 push()', () => {
        save()
        const bookmarks = new Bookmarks(os.tmpdir())
        const result1 = bookmarks.push({ title: 'dir3' } as T_Bookmark, true)
        const result2 = bookmarks.push({
            title: 'item3',
            url: 'google.com',
        } as T_Bookmark)

        const dirs = Object.values(bookmarks.get('dirs'))
        const items = Object.values(bookmarks.get('items'))

        expect(result1).toBeTruthy()
        expect(result2).toBeTruthy()
        expect(dirs[2].title).toBe('dir3')
        expect(items[0].title).toBe('item3')
        expect(items.length).toBe(3)
    })

    test('🤬 push()', () => {
        save()
        const bookmarks = new Bookmarks(os.tmpdir())
        // URL is not valid
        const fail1 = bookmarks.push({
            title: 'item3',
            url: 'url3',
        } as T_Bookmark)
        // title is empty
        const fail2 = bookmarks.push({
            title: '',
            url: 'http://google.com',
        } as T_Bookmark)

        expect(fail1).toBeFalsy()
        expect(fail2).toBeFalsy()
    })

    test('remove()', () => {
        save()
        const bookmarks = new Bookmarks(os.tmpdir())
        bookmarks.remove('a', true)
        bookmarks.remove('d')

        const dirs = Object.values(bookmarks.get('dirs'))
        const items = Object.values(bookmarks.get('items'))

        expect(dirs.length).toBe(1)
        expect(items.length).toBe(1)
        expect(dirs[0].id).toBe('b')
        expect(items[0].id).toBe('c')
        expect(items[0].parent).toBeFalsy()
    })
})
