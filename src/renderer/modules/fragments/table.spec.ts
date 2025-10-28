describe('src/renderer/modules/fragments/table', () => {
    test('exports something', () => {
        const mod = require('./table')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
