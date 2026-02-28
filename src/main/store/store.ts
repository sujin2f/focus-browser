import { app } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import { encrypt, decrypt } from '@src/common/utils/security'

type JsonObject = { [key: string]: unknown }

/**
 * Simple JSON-based storage
 * @see https://medium.com/cameron-nokes/how-to-store-user-data-in-electron-3ba6bf66bc1e
 *
 * Windows: %APPDATA%\[YourAppName]
 * macOS: ~/Library/Application Support/[YourAppName]
 * Linux: $XDG_CONFIG_HOME/[YourAppName] or ~/.config/[YourAppName]
 */
export class Store<T extends JsonObject> {
    protected fileName: string = ''
    protected defaults!: T

    protected _data: T = {} as T
    public get data() {
        return this._data
    }
    protected isSecure = false

    protected get path() {
        const userDataPath = this.userDataPath || app.getPath('userData')
        return path.join(userDataPath, `${this.fileName}.json`)
    }

    constructor(protected userDataPath?: string) {}

    /**
     * Get value by key
     *
     * @template {K} keyof T
     * @param {K} key only accepts a key of T
     * @returns {T[K]} returns the right type from the key
     */
    get<K extends keyof T>(key: K): T[K] {
        return this._data[key]
    }

    set<K extends keyof T>(key: K, value: T[K]) {
        this._data[key] = value
    }

    // ...and this will set it
    save(..._: unknown[]) {
        // TODO #122 make async or child process / Not to here directly, but its reference
        // Wait, I thought using the node.js' synchronous APIs was bad form?
        // We're not writing a server so there's not nearly the same IO demand on the process
        // Also if we used an async API and our app was quit before the asynchronous write had a chance to complete,
        // we might lose that data. Note that in a real app, we would try/catch this.
        let data = JSON.stringify(this._data)

        // encrypt buffer
        if (data && this.isSecure) {
            data = this.encrypt(data)
        }

        fs.writeFileSync(this.path, data, {
            encoding: 'utf-8',
        })
    }

    protected getFileContent() {
        // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
        // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
        try {
            return fs.readFileSync(this.path, 'utf-8')
        } catch {
            return ''
        }
    }

    parse() {
        let fileContent = this.getFileContent()

        if (!fileContent) {
            this._data = this.defaults
            return
        }

        // Decrypt buffer
        if (fileContent && this.isSecure) {
            fileContent = this.decrypt(fileContent)
        }

        this._data = JSON.parse(fileContent)
    }

    mergeDefault() {
        this._data = {
            ...this.defaults,
            ...this._data,
        }
    }

    protected encrypt(text: string) {
        return encrypt(text)
    }

    protected decrypt(text: string) {
        return decrypt(text)
    }
}
