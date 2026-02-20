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
