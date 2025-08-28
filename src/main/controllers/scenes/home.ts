import { resolveHtmlPath } from '../../util';
import Bookmarks from '../store/bookmarks';
import Scene from './scene';

/**
 * Home scene
 * Searching, bookmarks, history, etc.
 */
export default class SceneHome extends Scene {
    // Singleton instance
    static instance: SceneHome;
    static getInstance(): SceneHome {
        if (!SceneHome.instance) {
            SceneHome.instance = new SceneHome(resolveHtmlPath('index.html'), undefined);
        }
        return SceneHome.instance;
    }

    showAddressBar() {
        this.window?.webContents.send('show-address-bar');
    }

    showHome() {
        this.window?.webContents.send('show-home');
    }

    sendBookmarks() {
        const bookmarks = Bookmarks.getInstance().get();
        this.window?.webContents.send('bookmarks', bookmarks);
    }
}
