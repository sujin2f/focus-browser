import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark } from '../../types';

/**
 * Bookmarks Scene
 */
export default function Bookmarks() {
    // Refs for adding a bookmark
    const title = useRef<HTMLInputElement>(null);
    const url = useRef<HTMLInputElement>(null);

    // Bookmarks data
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

    // Add bookmark
    const addBookmark = useCallback(() => {
        const t = title.current?.value;
        const u = url.current?.value;
        if (!t || !u) {
            return;
        }

        window.electron?.ipcRenderer.sendMessage('bookmark-add', [
            title.current?.value,
            url.current?.value,
        ]);

        setBookmarks([
            ...bookmarks,
            {
                title: title.current?.value || '',
                url: url.current?.value || '',
            },
        ]);
    }, [bookmarks]);

    // Keyboard shortcuts
    const doShortcut = useCallback(
        (e: KeyboardEvent) => {
            if ((e.target as HTMLElement)?.tagName === 'INPUT') {
                return;
            }

            switch (e.key) {
                // Add Bookmark
                case 'a':
                case 'A':
                    addBookmark();
                    break;
                default:
            }
        },
        [addBookmark],
    );

    // Current page info for bookmarking
    const currentPage = useMemo(
        () => window.currentPage || { title: '', url: '' },
        [],
    );

    useEffect(() => {
        window.electron?.ipcRenderer.sendMessage('bookmarks', []);
        window.electron?.ipcRenderer.once('bookmarks', (args) => {
            setBookmarks(args as Bookmark[]);
        });
        document.addEventListener('keydown', doShortcut);

        return () => {
            window.removeEventListener('keydown', doShortcut);
        };
    }, [doShortcut]);

    return (
        <>
            <div>
                <h1 className="text-gray-500">Add Current Page</h1>
                <div className="grid grid-cols-2 gap-2">
                    <label
                        htmlFor="bookmark-title"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Title
                        <input
                            id="bookmark-title"
                            type="text"
                            name="title"
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
                            defaultValue={currentPage.title}
                            ref={title}
                        />
                    </label>
                    <label
                        htmlFor="bookmark-url"
                        className="block text-sm font-medium text-gray-700"
                    >
                        URL
                        <input
                            id="bookmark-url"
                            type="text"
                            name="url"
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
                            defaultValue={currentPage.url}
                            ref={url}
                        />
                    </label>
                </div>
                <button
                    type="button"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={addBookmark}
                >
                    Add Bookmark (A)
                </button>
            </div>

            <div className="mt-10">
                {bookmarks &&
                    bookmarks.length !== 0 &&
                    bookmarks.map((bookmark) => (
                        <div key={bookmark.url} className="mb-4">
                            <div className="text-lg font-medium text-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        window.electron?.ipcRenderer.sendMessage(
                                            'load-url',
                                            [bookmark.url],
                                        );
                                    }}
                                >
                                    {bookmark.title}
                                </button>
                            </div>
                        </div>
                    ))}
            </div>
        </>
    );
}
