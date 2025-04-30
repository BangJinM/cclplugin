import { ensureDirSync, readFile, writeFile } from 'fs-extra';
import { load } from 'js-yaml';
import { join } from 'path';

module.paths.push(join(Editor.App.path, 'node_modules'));

const { Asset } = require('@editor/asset-db');

import { IModuleOptions } from '../shader-graph';
import { declareNodeMenu } from '../shader-graph/declare/block';
import { generateEffectAsset } from './utils-3.8';

const VectorDataType = [
    'float',
    'vec2',
    'vec3',
    'vec4',
    'color',
    'enum',
    'boolean',
];

export class ShaderGraph {

    get assetType() {
        return 'cc.JsonAsset';
    }

    get version() {
        return '1.0.0';
    }

    get name() {
        return 'shader-graph';
    }

    get migrations() {
        return [];
    }

    shaderNodeClassMap: Map<string, any> = new Map;
    shaderContext: any;
    ShaderProperty: any;

    /**
     * 用于存储每个 asset 对应的 source
     * 导入前先换成，把 source 替换成 temp 路径下的 effect
     * 导入后在替换成原本的 source
     */
    public cacheSourceMap: Map<string, string> = new Map();

    _initedGraph = false;

    reset() {
        this._initedGraph = false;
    }
}

export default new ShaderGraph();
