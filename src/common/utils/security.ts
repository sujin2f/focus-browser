import { safeStorage } from 'electron'

export const base64encode = (text: string): string => {
    return Buffer.from(text, 'utf8').toString('base64')
}

export const base64decode = (text: string): string => {
    return Buffer.from(text, 'base64').toString('utf-8')
}

export const encrypt = (text: string): string => {
    return safeStorage.encryptString(text).toString('base64')
}

export const decrypt = (text: string): string => {
    return safeStorage.decryptString(Buffer.from(text, 'base64'))
}
