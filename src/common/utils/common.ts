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

export const fetchFavicon = async (_url: string): Promise<[string, string]> => {
    const url = getSafeUrl(_url)
    // 🤬 URL is not valid
    if (!url) throw new Error(`URL is not valid: ${_url}`) // TODO Log & Error
    const host = url.hostname
    const origin = `${url.protocol}//${host}`
    const DEFAULT = ['', ''] satisfies [string, string]
    return fetch(
        `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${origin}&size=32`,
        { headers: { 'Access-Control-Allow-Origin': '*' } },
    )
        .then(async (response) => {
            const image = response.headers.get('content-location')
            if (!image) return DEFAULT
            return [host, image] satisfies [string, string]
        })
        .catch(() => DEFAULT)
}
