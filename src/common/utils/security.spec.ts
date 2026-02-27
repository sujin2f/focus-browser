// yarn test security.spec.ts

import { base64encode, base64decode } from './security'

describe('security.ts', () => {
    test('base64', () => {
        const text = 'secure-text'
        const encoded = base64encode(text)
        const decoded = base64decode(encoded)

        expect(encoded).toBe('c2VjdXJlLXRleHQ=')
        expect(decoded).toBe(text)
    })
})
