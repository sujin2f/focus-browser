import {
    Menu,
    MenuItemConstructorOptions as ElectronMenuItemConstructorOptions,
} from 'electron';

type SystemType = 'darwin' | 'default';

export interface MenuItemConstructorOptions extends ElectronMenuItemConstructorOptions {
    selector?: string;
    submenu?: MenuItemConstructorOptions[] | Menu;
    system?: Array<SystemType>;
    accelerators?: { [K in SystemType]?: string };
}

/**
 * An abstract class for building application menus
 */
export default abstract class AbsMenuBuilder {
    abstract menu: MenuItemConstructorOptions[];

    buildMenu(): Menu {
        const template =
            process.platform === 'darwin'
                ? this.buildTemplate('darwin', this.menu)
                : this.buildTemplate('default', this.menu);

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);

        return menu;
    }

    buildTemplate(system: SystemType, menu: MenuItemConstructorOptions[]): ElectronMenuItemConstructorOptions[] {
        return menu.map((item) => {
            if (item.system && !item.system.includes(system)) {
                delete item.system;
                return item;
            }

            if (item.accelerators) {
                item.accelerator = item.accelerators[system];
                delete item.accelerators;
            }

            if (item.submenu && Array.isArray(item.submenu)) {
                item.submenu = this.buildTemplate(system, item.submenu)
            }

            delete item.system;
            return item;
        });
    }
}
