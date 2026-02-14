/* eslint-disable @typescript-eslint/no-explicit-any */
describe('src/renderer/util', () => {
    beforeEach(() => {
        jest.resetModules()
        // Ensure window.electron exists before importing the module which reads it at module-load time
        ;(global as any).window = (global as any).window || {}
        ;(global as any).window.electron = {
            ipcRenderer: {
                on: jest.fn(),
                sendMessage: jest.fn(),
                once: jest.fn(),
            },
        }
    })

    test('module loads and exposes helpers and ipcRenderer', () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const util = require('./utils')
        expect(util).toBeDefined()
        expect(util.ipcRenderer).toBeDefined()
        expect(typeof util.ipcRenderer.send).toBe('function')
        expect(typeof util.isMac).toBe('function')
        expect(typeof util.shortcutToHtml).toBe('function')
        expect(typeof util.navigate).toBe('function')
    })
})
