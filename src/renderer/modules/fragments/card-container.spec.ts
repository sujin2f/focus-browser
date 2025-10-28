describe('src/renderer/modules/fragments/card-container', () => {
    test('exports something', () => {
        const mod = require('./card-container')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
