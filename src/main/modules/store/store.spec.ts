// yarn test store.spec.ts

import { electron, mockEncryptString } from '@test/mock-electron'
import { fs, writeMock } from '@test/mock-fs'

jest.resetModules()
jest.doMock('electron', electron)
jest.doMock('fs', fs)

import { Store } from '@main/modules/store/store'

class TestSecureStore extends Store<{ foo: string }> {
    protected isSecure: boolean = true
}

describe('Base store (store.ts)', () => {
    test('module loads and persists via underlying fs', () => {
        // If the file exposes a class, attempt to instantiate or getInstance
        const store = new Store<{ foo: string }>('test', { foo: 'var' })
        expect(store).toBeDefined()

        // Default
        expect(store.get('foo')).toBe('var')

        // From .json file
        store.parse()
        expect(store.get('foo')).toBe('sujin')

        // Set value
        store.set('foo', 'value')
        expect(store.get('foo')).toBe('value')

        // Save
        store.save()
        expect(writeMock).toHaveBeenCalledWith(
            '/tmp/focus-test/test.json',
            '{"foo":"value"}',
            { encoding: 'utf-8' },
        )
    })

    test('secure module loads and persists via underlying fs', () => {
        const store = new TestSecureStore('test', { foo: 'var' })
        expect(store).toBeDefined()

        // Default
        expect(store.get('foo')).toBe('var')

        // Set value
        store.set('foo', 'value')
        expect(store.get('foo')).toBe('value')

        // Save
        store.save()
        expect(mockEncryptString).toHaveBeenCalledWith('{"foo":"value"}')
    })
})
