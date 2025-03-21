
import { writeFileSync } from 'fs';
import { basename, extname, join } from 'path';
import { GraphDataMgr } from '../editor/BehaviorTree/GraphDataMgr';
module.paths.push(join(Editor.App.path, 'node_modules'));
const { Asset, Importer } = require('@editor/asset-db');

export class BTGraph {
    get assetType() {
        return 'cc.JsonAsset';
    }

    get version() {
        return '1.0.0';
    }

    get name() {
        return 'bt-graph';
    }

    get migrations() {
        return [];
    }
}

export const btGraph = new BTGraph();

export function getName(path: string): string {
    return basename(path, extname(path));
}

const BTGraphHandler = {
    name: btGraph.name,
    extends: 'json',
    assetType: btGraph.assetType,
    iconInfo: {
        default: {
            type: 'image',
            value: 'packages://cclplugin/asset-icon.png',
        },
    },
    createInfo: {
        generateMenuInfo() {
            console.log('generateMenuInfo');
            return [
                {
                    label: `bt-graph`,
                    fullFileName: 'bt-graph.btgraph',
                    template: 'db://test.shadergraph', // 无用
                },
            ];
        },
        async create(options: { target: string, template: string }): Promise<string | null> {
            console.log('async create(options: { target: string, template: string }): Promise<string | null>');
            try {
                let shaderGraph = GraphDataMgr.getInstance().createDefaultData();
                writeFileSync(options.target, shaderGraph);
            } catch (e) {
                console.error(e);
            }

            return options.target;
        },
    },

    // @ts-expect-error
    async open(asset: Asset): Promise<boolean> {


        console.log('async open(asset: Asset): Promise<boolean> ');
        Editor.Message.send('cclplugin', 'open', asset.uuid);
        return true;
    },

    importer: {
        version: btGraph.version,
        migrations: btGraph.migrations,

        // @ts-expect-error
        async before(asset: Asset) {
            return true;
        },

        // @ts-expect-error
        async after(asset: Asset) {
            return true;
        },
    },
};

export const methods = {
    async registerShaderGraphImporter() {

        console.log('registerShaderGraphImporter');
        return BTGraphHandler;
    },
};
