import { ElectronHandler } from '../main/preload';

declare global {
    // eslint-disable-next-line no-unused-vars
    interface Window {
        electron: ElectronHandler;
        currentPage: {
            url: string;
            title: string;
            icon: string;
            description: string;
        };
    }
}

export {};
