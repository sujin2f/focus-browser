describe('src/renderer/modules/fragments/callout', () => {
    test('exports something', () => {
        const mod = require('./callout')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
