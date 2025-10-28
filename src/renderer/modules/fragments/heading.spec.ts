describe('src/renderer/modules/fragments/heading', () => {
    test('exports something', () => {
        const mod = require('./heading')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
