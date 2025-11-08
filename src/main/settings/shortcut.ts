import type { ShortcutStore } from '@src/common/types'
import { Menu, MenuCategory, SystemType } from '@src/common/constants'

export const SHORTCUTS: Record<SystemType, ShortcutStore> = {
    [SystemType.DARWIN]: {
        menu: {
            [MenuCategory.FOCUS]: {
                [Menu.ABOUT]: {
                    role: 'about',
                },
                [Menu.s0001]: {},
                [Menu.HIDE]: {
                    accelerator: 'Command+H',
                    role: 'hide',
                },
                [Menu.HIDE_OTHERS]: {
                    accelerator: 'Command+Shift+H',
                    role: 'hideOthers',
                },
                [Menu.SHOW_ALL]: {
                    role: 'unhide',
                },
                [Menu.s0002]: {},
                [Menu.QUIT]: {
                    accelerator: 'Command+Q',
                    role: 'quit',
                },
            },
            [MenuCategory.EDIT]: {
                [Menu.UNDO]: {
                    accelerator: 'Command+Z',
                    role: 'undo',
                },
                [Menu.REDO]: {
                    accelerator: 'Command+Shift+Z',
                    role: 'redo',
                },
                [Menu.s0001]: {},
                [Menu.CUT]: {
                    accelerator: 'Command+X',
                    role: 'cut',
                },
                [Menu.COPY]: {
                    accelerator: 'Command+C',
                    role: 'copy',
                },
                [Menu.PASTE]: {
                    accelerator: 'Command+V',
                    role: 'paste',
                },
                [Menu.SELECT_ALL]: {
                    accelerator: 'Command+A',
                    role: 'selectAll',
                },
                [Menu.s0002]: {},
                [Menu.FIND]: {
                    accelerator: 'Command+F',
                },
                [Menu.FIND_NEXT]: {
                    accelerator: 'Command+G',
                },
                [Menu.FIND_PREV]: {
                    accelerator: 'Shift+Command+G',
                },
                [Menu.STOP]: {
                    accelerator: 'Escape',
                },
                [Menu.s0003]: {},
                [Menu.ADD_BOOKMARK]: {
                    accelerator: 'Command+D',
                },
                [Menu.ADD_ANCHOR]: {
                    accelerator: 'Command+/',
                },
            },
            [MenuCategory.VIEW]: {
                [Menu.FULL_SCREEN]: {
                    accelerator: 'Command+Control+F',
                },
                [Menu.FIT_TO_SCREEN]: {
                    accelerator: 'Command+Escape',
                },
                [Menu.s0001]: {},
                [Menu.RESET_ZOOM]: {
                    accelerator: 'Command+0',
                    role: 'resetZoom',
                },
                [Menu.ZOOM_IN]: {
                    accelerator: 'Command+=',
                    role: 'zoomIn',
                },
                [Menu.ZOOM_OUT]: {
                    accelerator: 'Command+-',
                    role: 'zoomOut',
                },
                [Menu.s0002]: {},
                [Menu.DEVTOOLS]: {
                    accelerator: 'Command+Option+I',
                },
            },
            [MenuCategory.NAVIGATE]: {
                [Menu.ADDRESS]: {
                    accelerator: 'Command+L',
                },
                [Menu.CENTRE]: {
                    accelerator: 'Command+`',
                },
                [Menu.s0001]: {},
                [Menu.BACK]: {
                    accelerator: 'Command+[',
                },
                [Menu.BACK_HIDDEN]: {
                    accelerator: 'Command+Left',
                    visible: false,
                    acceleratorWorksWhenHidden: true,
                },
                [Menu.FORWARD]: {
                    accelerator: 'Command+]',
                },
                [Menu.FORWARD_HIDDEN]: {
                    accelerator: 'Command+Right',
                    visible: false,
                    acceleratorWorksWhenHidden: true,
                },
                [Menu.s0002]: {},
                [Menu.STOP]: {
                    accelerator: 'Escape',
                },
                [Menu.RELOAD]: {
                    accelerator: 'Command+R',
                },
            },
            [MenuCategory.WINDOW]: {
                [Menu.MINIMIZE]: {
                    accelerator: 'Command+M',
                    role: 'minimize',
                },
                [Menu.CLOSE]: {
                    accelerator: 'Command+W',
                    role: 'close',
                },
                [Menu.s0001]: {},
                [Menu.BRING_TO_FRONT]: {
                    role: 'front',
                },
            },
        },
        shortcuts: {
            'Command+H': Menu.HIDE,
            'Command+Shift+H': Menu.HIDE_OTHERS,
            'Command+Q': Menu.QUIT,
            'Command+Z': Menu.UNDO,
            'Command+Shift+Z': Menu.REDO,
            'Command+X': Menu.CUT,
            'Command+C': Menu.COPY,
            'Command+V': Menu.PASTE,
            'Command+A': Menu.SELECT_ALL,
            'Command+D': Menu.ADD_BOOKMARK,
            'Command+/': Menu.ADD_ANCHOR,
            'Command+Control+F': Menu.FULL_SCREEN,
            'Command+0': Menu.RESET_ZOOM,
            'Command+=': Menu.ZOOM_IN,
            'Command+-': Menu.ZOOM_OUT,
            'Command+Option+I': Menu.DEVTOOLS,
            'Command+L': Menu.ADDRESS,
            'Command+`': Menu.CENTRE,
            'Command+[': Menu.BACK,
            'Command+]': Menu.FORWARD,
            Escape: Menu.STOP,
            'Command+R': Menu.RELOAD,
            'Command+M': Menu.MINIMIZE,
            'Command+W': Menu.CLOSE,
            'Command+F': Menu.FIND,
            'Command+G': Menu.FIND_NEXT,
            'Shift+Command+G': Menu.FIND_PREV,
            'Command+Escape': Menu.FIT_TO_SCREEN,
        },
    },
    [SystemType.DEFAULT]: {
        menu: {
            [MenuCategory.FILE]: {
                [Menu.QUIT]: {
                    accelerator: 'Control+Q',
                    role: 'quit',
                },
            },
            [MenuCategory.EDIT]: {
                [Menu.UNDO]: {
                    accelerator: 'Control+Z',
                    role: 'undo',
                },
                [Menu.REDO]: {
                    accelerator: 'Control+Shift+Z',
                    role: 'redo',
                },
                [Menu.s0001]: {},
                [Menu.CUT]: {
                    accelerator: 'Control+X',
                    role: 'cut',
                },
                [Menu.COPY]: {
                    accelerator: 'Control+C',
                    role: 'copy',
                },
                [Menu.PASTE]: {
                    accelerator: 'Control+V',
                    role: 'paste',
                },
                [Menu.SELECT_ALL]: {
                    accelerator: 'Control+A',
                    role: 'selectAll',
                },
                [Menu.s0002]: {},
                [Menu.FIND]: {
                    accelerator: 'Control+F',
                },
                [Menu.FIND_NEXT]: {
                    accelerator: 'Control+G',
                },
                [Menu.FIND_PREV]: {
                    accelerator: 'Shift+Control+G',
                },
                [Menu.STOP]: {
                    accelerator: 'Escape',
                },
                [Menu.s0003]: {},
                [Menu.ADD_BOOKMARK]: {
                    label: 'Add Bookmark',
                    accelerator: 'Control+D',
                },
                [Menu.ADD_ANCHOR]: {
                    accelerator: 'Control+/',
                },
            },
            [MenuCategory.VIEW]: {
                [Menu.FULL_SCREEN]: {
                    accelerator: 'F11',
                },
                [Menu.FIT_TO_SCREEN]: {
                    accelerator: 'Control+Escape',
                },
                [Menu.s0001]: {},
                [Menu.RESET_ZOOM]: {
                    accelerator: 'Control+0',
                    role: 'resetZoom',
                },
                [Menu.ZOOM_IN]: {
                    accelerator: 'Control+=',
                    role: 'zoomIn',
                },
                [Menu.ZOOM_OUT]: {
                    accelerator: 'Control+-',
                    role: 'zoomOut',
                },
                [Menu.s0002]: {},
                [Menu.DEVTOOLS]: {
                    accelerator: 'Control+Shift+I',
                },
            },
            [MenuCategory.NAVIGATE]: {
                [Menu.ADDRESS]: {
                    accelerator: 'Control+L',
                },
                [Menu.CENTRE]: {
                    accelerator: 'Control+`',
                },
                [Menu.s0001]: {},
                [Menu.BACK]: {
                    accelerator: 'Control+[',
                },
                [Menu.BACK_HIDDEN]: {
                    accelerator: 'Control+Left',
                    visible: false,
                    acceleratorWorksWhenHidden: true,
                },
                [Menu.FORWARD]: {
                    accelerator: 'Control+]',
                },
                [Menu.FORWARD_HIDDEN]: {
                    accelerator: 'Control+Right',
                    visible: false,
                    acceleratorWorksWhenHidden: true,
                },
                [Menu.s0002]: {},
                [Menu.STOP]: {
                    accelerator: 'Escape',
                },
                [Menu.RELOAD]: {
                    accelerator: 'Control+R',
                },
            },
        },
        shortcuts: {
            'Control+Q': Menu.QUIT,
            'Control+Z': Menu.UNDO,
            'Control+Shift+Z': Menu.REDO,
            'Control+X': Menu.CUT,
            'Control+C': Menu.COPY,
            'Control+V': Menu.PASTE,
            'Control+A': Menu.SELECT_ALL,
            'Control+D': Menu.ADD_BOOKMARK,
            'Control+/': Menu.ADD_ANCHOR,
            F11: Menu.FULL_SCREEN,
            'Control+0': Menu.RESET_ZOOM,
            'Control+=': Menu.ZOOM_IN,
            'Control+-': Menu.ZOOM_OUT,
            'Control+Shift+I': Menu.DEVTOOLS,
            'Control+L': Menu.ADDRESS,
            'Control+`': Menu.CENTRE,
            'Control+[': Menu.BACK,
            'Control+]': Menu.FORWARD,
            Escape: Menu.STOP,
            'Control+R': Menu.RELOAD,
            'Control+F': Menu.FIND,
            'Control+G': Menu.FIND_NEXT,
            'Shift+Control+G': Menu.FIND_PREV,
            'Control+Escape': Menu.FIT_TO_SCREEN,
        },
    },
}
