import type { NavigationHistory } from 'electron'
import { electron } from '@test/mock-electron'
import { fs, readMock, writeMock } from '@test/mock-fs'

jest.resetModules()
jest.doMock('electron', electron)
jest.doMock('fs', fs)
readMock.mockReturnValue({
    index: 1,
    history: [
        { url: '0', title: '0' },
        { url: '1', title: '1' },
    ],
})

import { History } from '@main/store/history'

describe('History store (module)', () => {
    test('push updates storage', () => {
        const history = new History()
        history.parse()

        expect(history.current.url).toBe('1')
        expect(history.get('index')).toBe(1)

        const navHistory = {
            getEntryAtIndex: () => ({ url: '2' }),
            getAllEntries: (): unknown[] => [
                { url: '1' },
                { url: '2' },
                { url: '1' },
                { url: '3' },
                { url: '1' },
                { url: '1' },
                { url: '2' },
                { url: '1' },
                { url: '2' },
                { url: '3' },
                { url: '1' },
                { url: '2' },
                { url: '1' },
                { url: '2' },
                { url: '3' },
                { url: '1' },
                { url: '4' },
                { url: '2' },
            ],
            getActiveIndex: () => 17,
        }

        history.save(navHistory as unknown as NavigationHistory, 3)
        expect(writeMock).toHaveBeenCalledWith(
            '/tmp/focus-test/history.json',
            '{"index":2,"history":[{"url":"1"},{"url":"4"},{"url":"2"}]}',
            { encoding: 'utf-8' },
        )
    })
})
