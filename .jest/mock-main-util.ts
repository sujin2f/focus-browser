import { window } from './mock-window'

export const util = () => ({
    resolveHtmlPath: jest.fn(() => ''),
    preload: jest.fn(() => ''),
    adBlockerPreload: jest.fn(() => ''),
    getWindow: jest.fn(() => window().BrowserWindow),
})
