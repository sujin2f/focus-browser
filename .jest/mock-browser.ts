import { MockWebContentsView } from './mock-electron'

export const setAdBlocker = jest.fn()
export const loadURL = jest.fn()
export const addAnchor = jest.fn()
class MockBrowserView extends MockWebContentsView {
    active = true
    setAdBlocker = setAdBlocker
    loadURL = loadURL
    addAnchor = addAnchor
}

export const browser = () => ({
    BrowserView: MockBrowserView,
})
