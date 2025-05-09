import { PropertyDefine } from '../../../@types/bt-node-type';
import { MessageMgr, MessageType } from '../base';
import { Menu } from '../menu';
import {
    declareNodeMenu,
    nodeMenu,
} from './block';

let shaderPropertyMap = new Map();

function getPropertyDefineByType(type: string) {
    return shaderPropertyMap.get(type);
}

async function declareGraphBlock() {
    const propertyList = await MessageMgr.Instance.callSceneMethod('queryProperty');
    shaderPropertyMap = new Map(propertyList);


    const btTreeClassMap = await MessageMgr.Instance.callSceneMethod('queryBTNode');
    declareNodeMenu(btTreeClassMap);
    applyBlockToMenu()

    MessageMgr.Instance.send(MessageType.Declared);
    MessageMgr.Instance.callSceneMethod('afterDeclared');
}

function iteratePropertyDefines(handle: (define: PropertyDefine) => void) {
    shaderPropertyMap.forEach((define: PropertyDefine) => handle(define));
}

function applyBlockToMenu() {
    for (const element of nodeMenu) {
        let path = element.type + "/" + element.name
        Menu.Instance.addItemPath(path, {
            path: path,
            value: element.name,
            type: element.type,
        });
    }
}

export {
    applyBlockToMenu, declareGraphBlock,
    getPropertyDefineByType, iteratePropertyDefines
};


