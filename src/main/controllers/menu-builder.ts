import { Menu, MenuItemConstructorOptions } from 'electron';

type SystemType = 'darwin' | 'default';

export interface CustomMenuItemConstructor extends MenuItemConstructorOptions {
    selector?: string;
    submenu?: CustomMenuItemConstructor[] | Menu;
    system?: Array<SystemType>;
    accelerators?: { [K in SystemType]?: string };
}

/**
 * An abstract class for building application menus
 */
export default abstract class AbsMenuBuilder {
    abstract menu: CustomMenuItemConstructor[];

    buildMenu(): Menu {
        const template =
            process.platform === 'darwin'
                ? this.buildTemplate('darwin', this.menu)
                : this.buildTemplate('default', this.menu);

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);

        return menu;
    }

    buildTemplate(
        system: SystemType,
        menu: CustomMenuItemConstructor[],
    ): MenuItemConstructorOptions[] {
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
                item.submenu = this.buildTemplate(system, item.submenu);
            }

            delete item.system;
            return item;
        });
    }
}
