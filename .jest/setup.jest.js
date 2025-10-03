// import { TextDecoder, TextEncoder } from 'util'

// global.TextEncoder = TextEncoder
// global.TextDecoder = TextDecoder

// global.window.scrollTo = () => {}

// const observe = jest.fn()
// const unobserve = jest.fn()
// const disconnect = jest.fn()
global.window.electron = {
    ipcRenderer: {
        on: jest.fn(),
        sendMessage: jest.fn(),
        once: jest.fn(),
    },
}
