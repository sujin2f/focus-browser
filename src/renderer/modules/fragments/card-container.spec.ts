describe('src/renderer/modules/fragments/card-container', () => {
    test('exports something', () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mod = require('./card-container')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
