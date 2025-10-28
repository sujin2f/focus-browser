describe('src/renderer/modules/fragments/button-group', () => {
    test('exports something', () => {
        const mod = require('./button-group')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
