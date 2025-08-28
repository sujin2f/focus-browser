import { session } from 'electron';
import Scene from './scene';
import SceneHome from './home';

export default class SceneWebBrowser extends Scene {
    // Singleton instance
    /* eslint-disable-next-line no-use-before-define */
    static instance: SceneWebBrowser;

    static getInstance(): SceneWebBrowser {
        if (!SceneWebBrowser.instance) {
            SceneWebBrowser.instance = new SceneWebBrowser(
                'https://google.com',
                session.fromPartition('persist:my-partition'),
            );
        }
        return SceneWebBrowser.instance;
    }
}
