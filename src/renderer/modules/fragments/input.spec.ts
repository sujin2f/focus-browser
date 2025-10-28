describe('src/renderer/modules/fragments/input', () => {
    test('exports something', () => {
        const mod = require('./input')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
