import { safeStorage, net } from 'electron'
/* CONSTANTS */
import { SUJINC_URL } from '@src/common/constants'
/* Models */
import { Logger } from '@src/common/logger'

export const encrypt = (text: string): string =>
    safeStorage.encryptString(text).toString('base64')

export const decrypt = (text: string): string =>
    safeStorage.decryptString(Buffer.from(text, 'base64'))

export const base64encode = (text: string): string =>
    Buffer.from(text, 'utf-8').toString('base64')

export const base64decode = (text: string): string =>
    Buffer.from(text, 'base64').toString('utf-8')

export const verifyToken = async (_token: string): Promise<string> =>
    await import('jwt-decode')
        .then((module) => {
            const token = module.jwtDecode(_token)
            const now = new Date().getTime() / 1000
            if (
                token &&
                typeof token !== 'string' &&
                token.exp &&
                token.exp > now
            )
                return _token
            throw Logger.init().throw('JWT token is not valid')
        })
        .catch((e) => {
            throw Logger.init().throw('Failed to load jwt-decode', e.message)
        })

export const refreshToken = async (token: string) =>
    net
        .fetch(`${SUJINC_URL}/auth/refresh`, {
            method: 'POST',
            headers: { authorization: `Bearer ${token}` },
        })
        .then(async (result) => await result.json())
        .catch((e) => {
            throw Logger.init().throw(
                'Failed to refresh access token: ',
                e.message,
            )
        })
