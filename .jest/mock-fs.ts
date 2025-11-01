export const writeMock = jest.fn()
export const readMock = jest.fn()
readMock.mockReturnValue({ foo: 'sujin' })

export const fs = () => ({
    existsSync: jest.fn(() => true),
    readFileSync: jest.fn(() => JSON.stringify(readMock())),
    writeFileSync: writeMock,
    mkdirSync: jest.fn(),
})
