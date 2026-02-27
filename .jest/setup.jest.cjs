global.window.electron = {
    ipcRenderer: {
        on: jest.fn(),
        sendMessage: jest.fn(),
        once: jest.fn(),
    },
}

const log = jest.spyOn(console, 'log').mockImplementation(() => {})
const error = jest.spyOn(console, 'error').mockImplementation(() => {})
const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
const info = jest.spyOn(console, 'info').mockImplementation(() => {})

// No console
afterAll(() => {
    expect(log).toHaveBeenCalledTimes(0)
    expect(error).toHaveBeenCalledTimes(0)
    expect(warn).toHaveBeenCalledTimes(0)
    expect(info).toHaveBeenCalledTimes(0)
})
