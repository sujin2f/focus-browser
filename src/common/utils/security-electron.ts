import { safeStorage } from 'electron'

export const encrypt = (text: string): string => {
    return safeStorage.encryptString(text).toString('base64')
}

export const decrypt = (text: string): string => {
    return safeStorage.decryptString(Buffer.from(text, 'base64'))
}
