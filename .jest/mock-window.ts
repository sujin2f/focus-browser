export const window = () => ({
    BrowserWindow: {
        title: false,
        showContextMenu: jest.fn(),
        switch: jest.fn(),
    },
})
