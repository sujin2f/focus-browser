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
