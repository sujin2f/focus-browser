global.window.electron = {
    ipcRenderer: {
        on: jest.fn(),
        sendMessage: jest.fn(),
        once: jest.fn(),
    },
}

class Controller {
    setting = { frame: false }
}
global.window.controller = new Controller()

// import { Controller } from '@test/mock-renderer-controller'
// Object.defineProperty(window, 'controller', new Controller())
