import { exec } from 'node:child_process'
import util from 'util'
import * as fs from 'node:fs'
import os from 'os'
import path from 'path'

const execPromise = util.promisify(exec)

const { stdout } = await execPromise(`uname -a`)
if (stdout.includes('Linux')) {
    const homeDir = os.homedir()
    const userDataPath = path.join(homeDir, '.config', 'Electron')
    fs.rmSync(`${userDataPath}/status.json`, { recursive: false, force: true })
    fs.rmSync(`${userDataPath}/history.json`, { recursive: false, force: true })

    // status.json
    process.exit(0)
}

console.info(`Not detected.`)
process.exit(1)
