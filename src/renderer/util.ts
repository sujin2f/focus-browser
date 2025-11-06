import { Channel, RequestHandler, BROWSER, PageType } from '@src/constants'
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
    window.controller.switch(PageType.HOME)
    if (url) {
        ipcRenderer.send(Channel.SWITCH, BROWSER, url, handler)
        return
    }
    ipcRenderer.send(Channel.SWITCH, BROWSER)
}

export const shortcutToHtml = (shortcut: string) => {
    const keys = shortcut
        .split('+')
        .map((key) => key.trim())
        .map((key) =>
            new Element({
                tag: 'kbd',
                className: [
                    'border',
                    'bg-gray-400',
                    'text-gray-800',
                    'pr-1',
                    'pl-1',
                ],
            }).append(key),
        )

    return []
        .concat(
            ...keys.map((n) => [
                n,
                new Element({
                    tag: 'span',
                    className: ['text-gray-500'],
                }).append('+'),
            ]),
        )
        .slice(0, -1)
}

export const isMac = () => navigator.userAgent.indexOf('Mac') != -1
