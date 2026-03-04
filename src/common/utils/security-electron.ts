import { safeStorage } from 'electron'

export const encrypt = (text: string): string =>
    safeStorage.encryptString(text).toString('base64')

export const decrypt = (text: string): string =>
    safeStorage.decryptString(Buffer.from(text, 'base64'))
