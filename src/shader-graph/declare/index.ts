import { PropertyDefine } from '../../../@types/shader-node-type';
import { MessageMgr, MessageType } from '../base';
import { Menu } from '../menu';
import {
    declareNodeMenu,
    nodeMenu,
} from './block';

let shaderNodeMap = new Map();
let shaderPropertyMap = new Map();

function getPropertyDefineByType(type: string) {
    return shaderPropertyMap.get(type);
}

async function declareGraphBlock() {
    const { shaderNodeList, shaderPropertyList, btTreeClassMap } = await MessageMgr.Instance.callSceneMethod('queryShaderNode');
    shaderNodeMap = new Map(shaderNodeList);
    shaderPropertyMap = new Map(shaderPropertyList);

    declareNodeMenu(btTreeClassMap);
    applyBlockToMenu()

    console.log(btTreeClassMap)

    MessageMgr.Instance.send(MessageType.Declared);
    MessageMgr.Instance.callSceneMethod('afterDeclared');
}

function iteratePropertyDefines(handle: (define: PropertyDefine) => void) {
    shaderPropertyMap.forEach((define: PropertyDefine) => handle(define));
}


function applyBlockToMenu() {
    for (const element of nodeMenu) {
        Menu.Instance.addItemPath(element.type + "/" + element.name, {
            type: element.type + "/" + element.name,
        });
    }
}

export {
    applyBlockToMenu, declareGraphBlock,
    getPropertyDefineByType, iteratePropertyDefines
};


