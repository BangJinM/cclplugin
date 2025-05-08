import { GraphEditorAddOptions, MenuTemplateItem } from '../../../../bt-graph';

export interface TreeData {
    parent: TreeData | null,
    detail: {
        addOptions: GraphEditorAddOptions,
        value: string,
    },
    show: boolean,
    fold: boolean,
    showArrow: boolean,
    children: TreeData[],
}


export function getBoundingClientRect(target: HTMLElement) {
    if (document.body.getAttribute('name') === 'sub') {
        return {
            left: target.clientLeft,
            right: target.clientLeft + target.clientWidth,
            top: target.clientTop,
            bottom: target.clientTop + target.clientHeight,
            width: target.clientWidth,
            height: target.clientHeight,
        };
    }
    return target.getBoundingClientRect();
}

export function filterMenuByKeyword(tree: TreeData[], keyword: string): { firstSelect: TreeData | null, filterTree: TreeData[] } {
    const result: { firstSelect: TreeData | null, filterTree: TreeData[] } = {
        firstSelect: null,
        filterTree: [],
    };

    const keywordLowerCase = keyword.toLowerCase();
    function filterRecursive(menuItems: TreeData[]) {
        for (const item of menuItems) {
            item.show = false;

            const text = item.detail.value.toLowerCase();
            if (item.children.length === 0 &&
                (text.startsWith(keywordLowerCase) || text.includes(keywordLowerCase))) {
                item.show = true;
                let target = item.parent;
                while (target) {
                    if (target.show) break;
                    target.show = true;
                    target = target.parent;
                }
            }
            if (item.children && item.children.length > 0) {
                filterRecursive(item.children);
            }
        }
    }

    filterRecursive(tree);

    const list: TreeData[] = [];
    function filterItems(menuItems: TreeData[]) {
        menuItems = menuItems.filter((item: TreeData) => {
            if (item.show && item.children.length === 0) {
                list.push(item);
            }
            return item.show;
        });
        for (const menuItem of menuItems) {
            menuItem.children = filterItems(menuItem.children);
        }
        return menuItems;
    }

    return {
        filterTree: filterItems(tree),
        firstSelect: list[0],
    };
}

export function convertMenuData(menuData: MenuTemplateItem[], fold: boolean, parent?: TreeData): TreeData[] {
    return menuData.map((item: MenuTemplateItem) => {
        const submenu = item.submenu || [];
        const itemMenu: TreeData = {
            parent: parent || null,
            detail: {
                addOptions: item.addOptions!,
                value: item.label!,
            },
            show: true,
            fold: fold,
            showArrow: submenu.length > 0,
            children: [],
        };
        itemMenu.children = convertMenuData(submenu, fold, itemMenu);
        return itemMenu;
    });
}
