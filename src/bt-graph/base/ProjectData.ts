import { GraphEditorAddOptions, MessageMgr } from '.';
import { PropertyDefine } from '../../../@types/bt-node-type';

export interface MenuTemplateItem extends Editor.Menu.MenuTemplateItem {
    addOptions?: GraphEditorAddOptions;
}

/** 
 * 工程数据 
 * 1.可创建的节点
 * 2.可创建的参数
 */
class ProjectData {
    /** 可创建的参数 */
    variableMap = new Map();
    /** 可创建的节点 */
    btNodeMap: any[] = []
    /** 可创建的节点menu路径 */
    private nodeMenuMap: string[] = [];
    /** 可创建的节点数据 */
    private nodeMenuDataMap: Map<string, GraphEditorAddOptions> = new Map();

    getPropertyDefineByType(type: string) {
        return this.variableMap.get(type);
    }

    async declareGraphBlock() {
        const propertyList = await MessageMgr.Instance.callSceneMethod('queryVariableMap');
        this.variableMap = new Map(propertyList);

        const btTreeClassMap = await MessageMgr.Instance.callSceneMethod('queryNodeMap');
        this.btNodeMap.length = 0
        this.btNodeMap.push(...btTreeClassMap)
        this.applyNodeMenuData()
    }

    iteratePropertyDefines(handle: (define: PropertyDefine) => void) {
        this.variableMap.forEach((define: PropertyDefine) => handle(define));
    }

    applyNodeMenuData() {
        for (const element of this.btNodeMap) {
            let path = element.type + "/" + element.name
            if (!this.nodeMenuMap.includes(path)) {
                this.nodeMenuMap.push(path);
            }
            this.nodeMenuDataMap.set(path, {
                path: path,
                value: element.name,
                type: element.type,
            });
        }
    }

    getNodeMenu() {
        const menuItems: MenuTemplateItem[] = [];

        const menu = (menuPath: string) => {
            // 解析菜单路径字符串为菜单项数组
            function parseMenuPath(menuPath: string): MenuTemplateItem[] {
                return menuPath.split('/').map((label) => ({ label }));
            }
            // 循环迭代方式构建菜单项
            const buildMenuIteratively = (paths: string[], currentMenuItems: MenuTemplateItem[], baseMenuPath: string, fullMenuPath: string): void => {
                const label = paths.shift();
                if (!label) return;
                if (!fullMenuPath) {
                    fullMenuPath = label;
                } else {
                    fullMenuPath += '/' + label;
                }
                let menuItem: MenuTemplateItem | undefined = currentMenuItems.find(item => item.label === label);
                if (!menuItem) {
                    menuItem = { label, submenu: [] };
                    currentMenuItems.push(menuItem);
                }
                if (paths.length === 0) {
                    const addOptions = this.nodeMenuDataMap.get(baseMenuPath)!;
                    menuItem.addOptions = addOptions;
                }
                buildMenuIteratively(paths, menuItem.submenu!, baseMenuPath, fullMenuPath);
            };
            // 使用循环迭代方式构建菜单项
            buildMenuIteratively(menuPath.split('/'), menuItems, menuPath, '');
        };
        this.nodeMenuMap.forEach((menuPath, value) => menu(menuPath));
        return menuItems;
    }

}

export const projectData = new ProjectData()



