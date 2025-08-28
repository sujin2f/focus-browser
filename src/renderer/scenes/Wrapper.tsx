import { PropsWithChildren, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Wrapper component to handle scene changes and global shortcuts
 * Listens for IPC events to switch between scenes and update current page info
 * Wraps around child components to provide consistent layout and functionality
 */
export default function Wrapper({ children }: PropsWithChildren) {
    const navigate = useNavigate();

    const toAddressBar = useCallback(() => {
        navigate('/address');
    }, [navigate]);

    const toHome = useCallback(() => {
        navigate('/');
    }, [navigate]);

    // Update current page of browser info
    const setCurrentPage = (...args: unknown[]) => {
        window.currentPage = {
            url: (args[0] || '') as string,
            title: (args[1] || '') as string,
            icon: (args[2] || '') as string,
            description: (args[3] || '') as string,
        };
    };

    const doShortcut = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                window.electron?.ipcRenderer.sendMessage('show-browser', [
                    'browser',
                ]);
                return;
            }

            if ((e.target as HTMLElement)?.tagName === 'INPUT') {
                return;
            }

            switch (e.key) {
                // Bookmark
                case 'b':
                case 'B':
                    navigate('/bookmarks');
                    break;
                default:
            }
        },
        [navigate],
    );

    useEffect(() => {
        // IPC listeners for scene changes
        window.electron?.ipcRenderer.once('show-address-bar', toAddressBar);
        window.electron?.ipcRenderer.once('show-home', toHome);
        window.electron?.ipcRenderer.once('set-current-page', setCurrentPage);
        document.addEventListener('keydown', doShortcut);

        return () => {
            window.removeEventListener('keydown', doShortcut);
        };
    }, [doShortcut, toHome, toAddressBar]);

    return <div className="p-10">{children}</div>;
}

// Example of using IPC
// calling IPC exposed from preload script
// window.electron?.ipcRenderer.once('focus-address-bar', () => {
//     window.location.href = '/index.html?focusAddressBar=true';
// });
// window.electron?.ipcRenderer.sendMessage('ipc-example', ['ping']);
