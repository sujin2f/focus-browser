/* eslint-disable no-undef */
global.window.electron = {
    ipcRenderer: {
        on: jest.fn(),
        sendMessage: jest.fn(),
        once: jest.fn(),
    },
}
