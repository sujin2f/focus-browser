import { Channel, RequestHandler, SceneBrowser } from '@src/types'
import { Element } from '@home/modules/fragments'

export const checkElectron = () => {
    if (!window.electron) {
        throw new Error('Electron is not set.')
    }
}

export const ipcRenderer = {
    on: window.electron.ipcRenderer.on,
    send: window.electron.ipcRenderer.sendMessage,
    once: window.electron.ipcRenderer.once,
}

export const navigate = (url?: string, handler?: RequestHandler) => {
    if (url) {
        ipcRenderer.send(Channel.SWITCH, SceneBrowser.BROWSER, url, handler)
        return
    }

    ipcRenderer.send(Channel.SWITCH, SceneBrowser.BROWSER)
}

export const shortcutToHtml = (shortcut: string) => {
    const keys = shortcut
        .split('+')
        .map((key) => key.trim())
        .map(
            (key) =>
                new Element(
                    'kbd',
                    {
                        className: [
                            'border',
                            'bg-gray-400',
                            'text-gray-800',
                            'pr-1',
                            'pl-1',
                        ],
                    },
                    key,
                ),
        )

    return []
        .concat(
            ...keys.map((n) => [
                n,
                new Element('span', { className: ['text-gray-500'] }, '+'),
            ]),
        )
        .slice(0, -1)
}

export const isMac = () => navigator.userAgent.indexOf('Mac') != -1
