import { safeStorage } from 'electron'

export const encrypt = (text: string): string =>
    safeStorage.encryptString(text).toString('base64')

export const decrypt = (text: string): string =>
    safeStorage.decryptString(Buffer.from(text, 'base64'))

export const base64encode = (text: string): string =>
    Buffer.from(text, 'utf-8').toString('base64')

export const base64decode = (text: string): string =>
    Buffer.from(text, 'base64').toString('utf-8')
