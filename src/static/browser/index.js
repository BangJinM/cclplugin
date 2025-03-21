import { name } from '../../../package.json' with { type: 'json' };
import { GraphDataMgr } from '../../editor/BehaviorTree/GraphDataMgr';

export const methods = {
    async openBtGraphPanel() {
        console.log("openBtGraphPanel:" + name);
        Editor.Panel.open(`${name}.${"bt-graph"}`);
    },

    async openBtGraphPanelWithUUID(uuid) {
        console.log("openBtGraphPanelWithUUID:" + name);
        await Editor.Panel.open(`${name}.${"bt-graph"}`);
        Editor.Message.send(name, 'init-asset-uuid', uuid);
    },
};

export async function load() {
    console.log('load');
}

export function unload() {
    console.log('unload');
}
