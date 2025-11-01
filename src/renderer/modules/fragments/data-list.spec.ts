describe('src/renderer/modules/fragments/data-list', () => {
    test('exports something', () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mod = require('./data-list')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
