import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
    addressBar?: boolean;
};

export default function Main({ addressBar }: Props) {
    const navigate = useNavigate();
    const address = useRef<HTMLInputElement>(null);

    // Address bar enter
    const handleMoveToAddress = useCallback(() => {
        if (address.current?.value) {
            window.electron?.ipcRenderer.sendMessage('load-url', [
                address.current?.value,
            ]);
            address.current.value = '';
        }
    }, []);

    // Focus address bar when shown
    useEffect(() => {
        if (addressBar) {
            address.current?.focus();
        } else {
            address.current?.blur();
        }
    }, [addressBar]);

    return (
        <>
            <input
                type="text"
                className="w-full text-lg bg-gray-800 p-3 rounded-lg text-white"
                placeholder="Search or enter address (⌘L)"
                ref={address}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleMoveToAddress();
                    }
                }}
            />
            <div className="text-gray-500">
                <p>Search the web with Focus Browser</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3">
                <div
                    className="p-4 border border-gray-300 m-2 rounded-lg bg-white shadow"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                        navigate('/bookmarks');
                    }}
                    onKeyUp={() => {}}
                >
                    <h2 className="text-lg font-semibold mb-2">
                        Bookmarks (B)
                    </h2>
                    <p className="text-gray-600">
                        This is a sample card description.
                    </p>
                </div>
            </div>
        </>
    );
}

Main.defaultProps = {
    addressBar: false,
};
