import { MockWebContentsView } from './mock-electron'

export const setAdBlocker = jest.fn()
export const loadURL = jest.fn()
class MockBrowserView extends MockWebContentsView {
    setAdBlocker = setAdBlocker
    loadURL = loadURL
}

export const browser = () => ({
    BrowserView: MockBrowserView,
})
