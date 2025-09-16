import { app } from 'electron'
import { CustomMenuItemConstructor } from '@src/main/modules/menu-builder'

export const menu = (callbacks: {
    [key: string]: (...args: unknown[]) => void
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
            { type: 'separator' },
            {
                label: 'Add Bookmark',
                accelerator: 'CommandOrControl+D',
                click: callbacks.addBookmark,
            },
            {
                label: 'Add Anchor',
                accelerator: 'CommandOrControl+/',
                click: callbacks.addAnchor,
            },
        ],
    },
    {
        label: 'View',
        submenu: [
            {
                label: 'Address Bar',
                accelerator: 'CommandOrControl+L',
                click: callbacks.address,
            },
            {
                label: 'Show Control Centre',
                accelerator: 'CommandOrControl+`',
                click: callbacks.home,
            },
            { type: 'separator' },
            {
                label: 'Toggle Full Screen',
                accelerator: 'Ctrl+CommandOrControl+F',
                click: callbacks.fullscreen,
            },
            {
                label: 'Reset Zoom',
                accelerator: 'CommandOrControl+0',
                role: 'resetZoom',
            },
            {
                label: 'Zoom In',
                accelerator: 'CommandOrControl+=',
                role: 'zoomIn',
            },
            {
                label: 'Zoom Out',
                accelerator: 'CommandOrControl+-',
                role: 'zoomOut',
            },
            { type: 'separator' },
            {
                label: 'Stop',
                accelerator: 'Escape',
                click: callbacks.stop,
            },
            {
                label: 'Reload',
                accelerator: 'CommandOrControl+R',
            },
            { type: 'separator' },
            {
                label: 'Toggle Developer Tools',
                accelerator: 'Shift+CommandOrControl+I',
                click: callbacks.devtool,
            },
        ],
    },
    {
        label: 'Navigate',
        submenu: [
            {
                label: 'Back',
                accelerator: 'CommandOrControl+[',
                click: callbacks.historyBack,
            },
            {
                label: 'Forward',
                accelerator: 'CommandOrControl+]',
                click: callbacks.historyForward,
            },
            { type: 'separator' },
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
