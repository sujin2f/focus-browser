import { Menu, MenuItemConstructorOptions } from 'electron'

type SystemType = 'darwin' | 'default'

export interface CustomMenuItemConstructor extends MenuItemConstructorOptions {
    selector?: string
    submenu?: CustomMenuItemConstructor[] | Menu
    system?: Array<SystemType>
}

/**
 * An abstract class for building application menus
 */
export default class MenuBuilder {
    constructor(menu: CustomMenuItemConstructor[]) {
        this.buildMenu(menu)
    }

    private buildMenu(menu: CustomMenuItemConstructor[]): Menu {
        const template =
            process.platform === 'darwin'
                ? this.buildTemplate('darwin', menu)
                : this.buildTemplate('default', menu)

        const built = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(built)

        return built
    }

    private buildTemplate(
        system: SystemType,
        menu: CustomMenuItemConstructor[],
    ): MenuItemConstructorOptions[] {
        return menu.map((item) => {
            if (item.system && !item.system.includes(system)) {
                delete item.system
                return item
            }

            if (item.submenu && Array.isArray(item.submenu)) {
                item.submenu = this.buildTemplate(system, item.submenu)
            }

            delete item.system
            return item
        })
    }
}
