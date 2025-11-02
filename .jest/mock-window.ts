export const window = () => ({
    BrowserWindow: {
        getInstance: () => ({
            title: false,
            showContextMenu: jest.fn(),
            switch: jest.fn(),
        }),
    },
})
