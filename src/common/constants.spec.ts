// yarn test constants.spec.ts

import { SUJINC_DOMAIN, SUJINC_URL } from './constants'

describe('constants (constants.ts)', () => {
    test('sujinc.com URL is well assigned', async () => {
        expect(SUJINC_DOMAIN).toEqual('sujinc.com')
        expect(SUJINC_URL).toEqual('https://sujinc.com')
    })
})
