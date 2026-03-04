import { Logger } from '@src/common/logger'

export const isMain = () => {
    if (typeof process === 'undefined') return false
    if (process.type === 'renderer') return false
    return true
}

export const isBeta = () => {
    if (isMain()) return process.env.IS_BETA
    return typeof envBeta !== 'undefined' && envBeta
}

export const isDev = () => {
    if (isMain())
        return (
            typeof process !== 'undefined' &&
            process.env.NODE_ENV === 'development'
        )
    return typeof envDev !== 'undefined' && envDev
}

export const isTest = () => {
    return typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
}

export const canLog = () => isDev() || (isBeta() && !isTest())

export const isNatural = (arg: number) => {
    return arg >= 0
}

export const byteToSize = (byte: number): string => {
    const mb = 1024 * 1024
    if (byte < mb) return `${byte} bytes`
    const gb = mb * 1024
    if (byte < gb) return `${(byte / mb).toFixed(2)} Mb`
    return `${(byte / gb).toFixed(2)} Gb`
}

/**
 *
 * @param url
 * @returns {URL | false | undefined} undefined: empty, false: not URL
 */
export const getSafeUrl = (text: string): URL | false | undefined => {
    const trimmed = text.trim()
    // 🤬 Text does not exist
    if (!text || !trimmed) return

    // A regular expression to check if a schema (e.g., 'http://', 'https://', 'ftp://') is present.
    const hasSchema = /^[a-z]+:\/\//i.test(trimmed)

    let url
    try {
        url = new URL(hasSchema ? trimmed : `http://${trimmed}`)
    } catch {
        // 🤬 Not URL
        return false
    }

    // 🤬 URL is not valid
    if (!url.hostname.includes('localhost') && !url.hostname.includes('.'))
        return false
    return url
}

/**
 * 🅕 Get Favicon from gStatic
 * @param _url
 * @returns {[string, string]} host and image
 */
export const fetchFavicon = async (_url: string): Promise<[string, string]> => {
    const url = getSafeUrl(_url)
    // 🤬 URL is not valid
    if (!url) throw Logger.init().throw(`URL is not valid: ${_url}`)

    const host = url.hostname
    const origin = `${url.protocol}//${host}`
    const DEFAULT = ['', ''] satisfies [string, string]

    return await fetch(
        `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${origin}&size=32`,
    )
        .then(async (response) => {
            const image = response.headers.get('content-location')
            // 🤬 Image does not exist
            if (!image) return DEFAULT

            // Check image accessibility
            return await fetch(image)
                .then(async (responseImageUrl) => {
                    // 😃 Image is accessible
                    if (responseImageUrl.status === 200)
                        return [host, image] satisfies [string, string]

                    // 🤬 URL is not accessible, store image as base64
                    const bytes = await response.bytes()
                    const buffer = Buffer.from(bytes)
                    return [
                        host,
                        `data:image/png;base64,${buffer.toString('base64')}`,
                    ] satisfies [string, string]
                })
                .catch(() => DEFAULT)
        })
        .catch(() => DEFAULT)
}
