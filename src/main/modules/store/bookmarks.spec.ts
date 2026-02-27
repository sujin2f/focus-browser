// yarn test bookmarks.spec.ts

import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'
import { electron } from '@test/mock-electron'

jest.resetModules()
jest.doMock('electron', electron)

import { Bookmarks } from '@main/modules/store/bookmarks'
import type { T_Bookmark } from '@src/common/types'

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
                c: { id: 'c', title: 'item1', url: 'url1' },
                d: { id: 'd', title: 'item2', url: 'url2' },
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

        expect(bookmarks.dirs[0].title).toBe('dir')
        expect(bookmarks.items[0].title).toBe('bm')
        expect(bookmarks.items[0].parent).toBe(bookmarks.dirs[0].id)
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

        expect(bookmarks.dirs[0].title).toBe('dir')
        expect(bookmarks.items[0].title).toBe('bm')
        expect(bookmarks.items[0].parent).toBe(bookmarks.dirs[0].id)
    })

    test('update()', () => {
        save()
        const bookmarks = new Bookmarks(os.tmpdir())
        bookmarks.update({ id: 'a', title: 'changed' } as T_Bookmark, true)
        bookmarks.update({
            id: 'c',
            title: 'changed',
            url: 'url1',
        } as T_Bookmark)
        // Not exits item doesn't change anything
        bookmarks.update({
            id: 'b',
            title: 'changed',
            url: 'url1',
        } as T_Bookmark)

        expect(bookmarks.dirs).toStrictEqual([
            { id: 'a', title: 'changed' },
            { id: 'b', title: 'dir2' },
        ])
        expect(bookmarks.items).toStrictEqual([
            { id: 'c', title: 'changed', url: 'url1' },
            { id: 'd', title: 'item2', url: 'url2' },
        ])
    })

    test('push()', () => {
        save()
        const bookmarks = new Bookmarks(os.tmpdir())
        bookmarks.push({ title: 'dir3' } as T_Bookmark, true)
        bookmarks.push({ title: 'item3', url: 'url3' } as T_Bookmark)
        // URL Duplicated item doesn't change anything
        bookmarks.update({ title: 'item4', url: 'url1' } as T_Bookmark)

        expect(bookmarks.dirs[2].title).toBe('dir3')
        expect(bookmarks.items[0].title).toBe('item3')
        expect(bookmarks.items.length).toBe(3)
    })

    test('remove()', () => {
        save()
        const bookmarks = new Bookmarks(os.tmpdir())
        bookmarks.remove('a')
        bookmarks.remove('d')

        expect(bookmarks.dirs.length).toBe(1)
        expect(bookmarks.items.length).toBe(1)
        expect(bookmarks.dirs[0].id).toBe('b')
        expect(bookmarks.items[0].id).toBe('c')
    })
})
