// yarn test store.spec.ts

import { electron, mockEncryptString } from '@test/mock-electron'
import { fs } from '@test/mock-fs'

jest.resetModules()
jest.doMock('electron', electron)
jest.doMock('fs', fs)

import { Store } from '@main/modules/store/store'

class TestSecureStore extends Store<{ foo: string }> {
    protected fileName = 'test'
    protected defaults = { foo: 'var' }
    protected isSecure: boolean = true

    constructor() {
        super()
        this.mergeDefault()
    }
}

describe('Base store (store.ts)', () => {
    test('secure module loads and persists via underlying fs', () => {
        const store = new TestSecureStore()
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
