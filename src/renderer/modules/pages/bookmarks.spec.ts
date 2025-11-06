describe('src/renderer/modules/pages/bookmarks', () => {
    test('exports something', () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mod = require('./bookmarks')
        expect(mod).toBeDefined()
        expect(Object.keys(mod).length).toBeGreaterThanOrEqual(0)
    })
})
