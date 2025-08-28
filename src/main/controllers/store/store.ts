import { app } from 'electron';
import path from 'path';
import fs from 'fs';

type JsonObject = { [key: string]: unknown };

/**
 * Simple JSON-based storage
 * @see https://medium.com/cameron-nokes/how-to-store-user-data-in-electron-3ba6bf66bc1e
 */
export default class Store<T extends JsonObject> {
    protected data: T = {} as T;

    protected path: string = '';

    constructor(
        protected configName: string,
        protected defaults: T,
    ) {
        this.init();
    }

    private init() {
        // app.getPath('userData') will return a string of the user's app data directory path.
        const userDataPath = app.getPath('userData');
        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        this.path = path.join(userDataPath, `${this.configName}.json`);
        this.data = this.parse();
    }

    // This will just return the property on the `data` object
    get(key: string) {
        return this.data[key];
    }

    // ...and this will set it
    set() {
        // Wait, I thought using the node.js' synchronous APIs was bad form?
        // We're not writing a server so there's not nearly the same IO demand on the process
        // Also if we used an async API and our app was quit before the asynchronous write had a chance to complete,
        // we might lose that data. Note that in a real app, we would try/catch this.
        fs.writeFileSync(this.path, JSON.stringify(this.data), {
            encoding: 'utf-8',
        });
    }

    parse() {
        // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
        // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
        try {
            return JSON.parse(fs.readFileSync(this.path, 'utf-8'));
        } catch (error) {
            // if there was some kind of error, return the passed in defaults instead.
            return this.defaults;
        }
    }
}
