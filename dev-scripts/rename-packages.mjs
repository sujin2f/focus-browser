import * as fs from 'node:fs'
import * as path from 'node:path'

if (process.argv.includes('--ignore')) {
    process.exit()
}

const pathPackage = path.resolve('release', 'app', 'package.json')
const dirBuild = path.resolve('release', 'build')
const dirPackages = path.resolve(dirBuild, 'packages')

const version = JSON.parse(fs.readFileSync(pathPackage, 'utf-8')).version

fs.readdir(dirBuild, (err, files) => {
    if (err) throw err

    fs.rmSync(dirPackages, { recursive: true, force: true })
    fs.mkdirSync(dirPackages)

    files.forEach((filename) => {
        const extension = filename.match(/\.(dmg|exe|deb)$/)
        if (extension) {
            const platform = filename.match(/(amd64|arm64)/)
            const dest = `Focus-${version}${platform ? `-${platform[0]}` : ''}.${extension[1]}`
            fs.copyFileSync(
                path.resolve(dirBuild, filename),
                path.resolve(dirPackages, dest),
            )
        }
    })
})
