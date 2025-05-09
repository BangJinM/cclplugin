import { writeFileSync } from 'fs-extra';
import { join } from 'path';

import { GraphDataMgr, getName } from '../bt-graph';
import btGraph from './bt-graph';

module.paths.push(join(Editor.App.path, 'node_modules'));

const { Asset } = require('@editor/asset-db');

const BTGraphHandler = {

    name: btGraph.name,

    extends: 'json',

    assetType: btGraph.assetType,

    iconInfo: {
        default: {
            type: 'image',
            value: 'packages://bt-graph/static/asset-icon.png',
        },
    },

    createInfo: {
        generateMenuInfo() {
            return [
                {
                    label: `bt-graph`,
                    fullFileName: 'bt-graph.btgraph',
                    template: 'db://test.btgraph', // 无用
                }]
        },
        async create(options: { target: string, template: string }): Promise<string | null> {
            try {
                let shaderGraph = '';
                const name = getName(options.target);
                shaderGraph = await GraphDataMgr.createDefaultShaderGraph(name);
                writeFileSync(options.target, shaderGraph);
            } catch (e) {
                console.error(e);
            }
            return options.target;
        },
    },

    // @ts-expect-error
    async open(asset: Asset): Promise<boolean> {
        Editor.Message.send('bt-graph', 'open', asset.uuid);
        return true;
    },

    importer: {
        version: btGraph.version,

        migrations: [],

        /** 解析 */
        // @ts-expect-error
        async before(asset: Asset) {
            // await shaderGraph.generateEffectByAsset(asset);
            // shaderGraph.cacheSourceMap.set(asset.uuid, asset._source);
            // // @ts-ignore
            // asset._source = shaderGraph.getTempEffectCodePath(asset);
            return true;
        },

        // @ts-expect-error
        async after(asset: Asset) {
            // const source = shaderGraph.cacheSourceMap.get(asset.uuid);
            // if (source) {
            //     // @ts-ignore
            //     asset._source = source;
            //     shaderGraph.cacheSourceMap.delete(asset.uuid);
            // }
            return true;
        },
    },
};

export default BTGraphHandler;
