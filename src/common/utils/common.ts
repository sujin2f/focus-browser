export const isBeta = () => {
    if (typeof window !== 'object') {
        return process.env.IS_BETA
    }
    return typeof envBeta !== 'undefined' && envBeta
}

export const isDev = () => {
    return (
        typeof process !== 'undefined' && process.env.NODE_ENV === 'development'
    )
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
