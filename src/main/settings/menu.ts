import { app } from 'electron'
import { CustomMenuItemConstructor } from '@main/controllers/menu-builder'

export const menu = (callbacks: {
    [key: string]: () => void
}): CustomMenuItemConstructor[] => [
    {
        label: 'Focus',
        system: ['darwin'],
        submenu: [
            {
                label: 'About Focus',
                selector: 'orderFrontStandardAboutPanel:',
            },
            { type: 'separator' },
            {
                label: 'Hide ElectronReact',
                accelerator: 'Command+H',
                selector: 'hide:',
            },
            {
                label: 'Hide Others',
                accelerator: 'Command+Shift+H',
                selector: 'hideOtherApplications:',
            },
            { label: 'Show All', selector: 'unhideAllApplications:' },
            { type: 'separator' },
            {
                label: 'Quit',
                accelerator: 'Command+Q',
                click: () => {
                    app.quit()
                },
            },
        ],
    },
    {
        label: 'Edit',
        system: ['darwin', 'default'],
        submenu: [
            {
                label: 'Undo',
                accelerator: 'CommandOrControl+Z',
                selector: 'undo:',
            },
            {
                label: 'Redo',
                accelerator: 'Shift+CommandOrControl+Z',
                selector: 'redo:',
            },
            { type: 'separator' },
            {
                label: 'Cut',
                accelerator: 'CommandOrControl+X',
                selector: 'cut:',
            },
            {
                label: 'Copy',
                accelerator: 'CommandOrControl+C',
                selector: 'copy:',
            },
            {
                label: 'Paste',
                accelerator: 'CommandOrControl+V',
                selector: 'paste:',
            },
            {
                label: 'Select All',
                accelerator: 'CommandOrControl+A',
                selector: 'selectAll:',
            },
        ],
    },
    {
        label: 'View',
        system: ['darwin', 'default'],
        submenu: [
            {
                label: 'Address Bar',
                accelerator: 'CommandOrControl+L',
                click: callbacks.address,
            },
            {
                label: 'Show Home',
                accelerator: 'CommandOrControl+`',
                click: callbacks.home,
            },
            { type: 'separator' },
            {
                label: 'Reload',
                accelerator: 'CommandOrControl+R',
                click: callbacks.reload,
            },
            {
                label: 'Toggle Full Screen',
                accelerator: 'Ctrl+CommandOrControl+F',
                click: callbacks.fullscreen,
            },
            { type: 'separator' },
            {
                label: 'Toggle Developer Tools',
                accelerator: 'Alt+CommandOrControl+I',
                click: callbacks.devtool,
            },
        ],
    },
    {
        label: 'Navigate',
        system: ['darwin', 'default'],
        submenu: [
            {
                label: 'Back',
                accelerator: 'CommandOrControl+Left',
                click: callbacks.historyBack,
            },
            {
                label: 'Forward',
                accelerator: 'CommandOrControl+Right',
                click: callbacks.historyForward,
            },
        ],
    },
    {
        label: 'Window',
        system: ['darwin'],
        submenu: [
            {
                label: 'Minimize',
                accelerator: 'Command+M',
                selector: 'performMiniaturize:',
            },
            {
                label: 'Close',
                accelerator: 'Command+W',
                selector: 'performClose:',
            },
            { type: 'separator' },
            { label: 'Bring All to Front', selector: 'arrangeInFront:' },
        ],
    },
]
