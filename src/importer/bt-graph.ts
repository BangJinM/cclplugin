import { join } from 'path';

module.paths.push(join(Editor.App.path, 'node_modules'));

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

    get migrations(): any[] {
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

export default new BTGraph();
