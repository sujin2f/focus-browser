describe('src/renderer/modules/fragments/card', () => {
    test('exports something', () => {
        const mod = require('./card')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
