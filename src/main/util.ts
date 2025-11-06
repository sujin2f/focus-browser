import * as path from 'path'

export function resolveHtmlPath(htmlFileName: string) {
    if (process.env.NODE_ENV === 'development') {
        const port = process.env.PORT || 1212
        const url = new URL(`http://localhost:${port}`)
        url.pathname = htmlFileName
        return url.href
    }
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`
}

export const preload = path.join(__dirname, '..', 'preload.js')
export const adBlockerPreload = path.join(
    __dirname,
    '..',
    'adblocker-preload.js',
)
