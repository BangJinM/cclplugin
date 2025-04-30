
export const nodeMenu: any[] = []

export function declareNodeMenu(nodeProperty: any[] = []) {
    console.log(nodeProperty)
    nodeMenu.length = 0
    nodeMenu.push(...nodeProperty)
}
