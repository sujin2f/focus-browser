export const isBeta = () => {
    if (typeof window !== 'object') {
        return process.env.IS_BETA
    }
    return typeof envBeta !== 'undefined' && envBeta
}

export const isTest = () => {
    return typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
}
