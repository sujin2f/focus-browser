export const isBeta = () => {
    if (typeof window !== 'object') {
        return process.env.IS_BETA
    }
    return typeof envBeta !== 'undefined' && envBeta
}

export const isDev = () => {
    if (typeof window !== 'object') {
        return (
            typeof process !== 'undefined' &&
            process.env.NODE_ENV === 'development'
        )
    }
    return typeof envDev !== 'undefined' && envDev
}

export const isTest = () => {
    return typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
}

export const isNatural = (arg: number) => {
    return arg >= 0
}

export const byteToSize = (byte: number): string => {
    const mb = 1024 * 1024
    if (byte < mb) {
        return `${byte} bytes`
    } else if (byte < mb * 1024) {
        const size = byte / mb
        return `${size.toFixed(2)} Mb`
    }
    const size = byte / (mb * 1024)
    return `${size.toFixed(2)} Gb`
}

/**
 *
 * @param url
 * @returns {URL | false | undefined} undefined: empty, false: not URL
 */
export const getSafeUrl = (text: string): URL | false | undefined => {
    const trimmed = text.trim()
    if (!text || !trimmed) {
        return
    }

    // A regular expression to check if a schema (e.g., 'http://', 'https://', 'ftp://') is present.
    const hasSchema = /^[a-z]+:\/\//i.test(trimmed)

    let url
    try {
        url = new URL(hasSchema ? trimmed : `http://${trimmed}`)
    } catch {
        // Not URL
        return false
    }

    if (!url.hostname.includes('localhost') && !url.hostname.includes('.')) {
        return false
    }
    return url
}

export const fetchFavicon = async (url: string): Promise<string> => {
    return fetch(
        `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=32`,
    )
        .then(async (response) => {
            const bytes = await response.bytes()
            const buffer = Buffer.from(bytes)
            return buffer.toString('base64')
        })
        .catch(() => '')
}
