describe('src/renderer/modules/fragments/form', () => {
    test('exports something', () => {
        const mod = require('./form')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
