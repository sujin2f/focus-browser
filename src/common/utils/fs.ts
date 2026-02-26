import { app } from 'electron'

import * as path from 'path'
import * as fs from 'fs'

export const paths = {
    preload: path.join(__dirname, 'preload.js'),
    preloadAdBlocker: path.join(__dirname, 'adblocker-preload.js'),
    childProcess: path.join(__dirname, 'child-process.js'),
}

/**
 * Gets the renderer .html path
 *
 * @param htmlFileName
 * @returns
 */
export function resolveHtmlPath(htmlFileName: string) {
    if (process.env.NODE_ENV === 'development') {
        const port = process.env.PORT || 1212
        const url = new URL(`http://localhost:${port}`)
        url.pathname = htmlFileName
        return url.href
    }
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`
}

export const getDirectorySize = (dir: string): number => {
    const files = fs.readdirSync(dir, { withFileTypes: true }) // Get file entries with type info
    const paths = files.map((file) => {
        const fullPath = path.join(dir, file.name)
        if (file.isDirectory()) {
            return getDirectorySize(fullPath) // Recurse into subdirectories
        }
        if (file.isFile()) {
            const { size } = fs.statSync(fullPath)
            return size // Get the size of the file in bytes
        }
        return 0
    })

    return paths
        .flat(Infinity)
        .reduce((accumulator, size) => accumulator + size, 0)
}

export const removeDirectory = (dir: string) => {
    const files = fs.readdirSync(dir, { withFileTypes: true })
    files.forEach((file) => {
        const dest = `${file.parentPath}/${file.name}`
        if (file.isDirectory()) {
            fs.rmSync(dest, { recursive: true, force: true })
        } else {
            fs.rmSync(dest)
        }
    })
}

export const getIndexedDBPath = () => {
    const userDataPath = app.getPath('userData')
    return path.join(userDataPath, 'Partitions', 'my-partition', 'IndexedDB')
}
