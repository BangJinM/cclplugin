

import { AssetInfo } from '@cocos/creator-types/editor/packages/asset-db/@types/public';
import { generateUUID } from '../utils';
import { GraphData, MaskMgr, MessageMgr, MessageType } from './index';

/**
 * 用于处理 bt-graph 数据
 */
export class GraphDataMgr {

    static _instance: GraphDataMgr | null = null;

    /**
     * 表示是否设置 Graph
     * @private
     */
    protected _dirty = false;

    // 图数据
    protected lastGraphData: GraphData | undefined;
    public graphData: GraphData = {
        name: "ROOT",
        nodes: {},
        lines: {},
        properties: [],
    };

    public queue: GraphData[] = []

    public static get Instance(): GraphDataMgr {
        if (!this._instance) {
            this._instance = new GraphDataMgr();
        }
        return this._instance;
    }

    public static async createDefaultShaderGraph(graphName = 'New BT Graph') {
        const graphGraphData: GraphData = {
            name: graphName,
            nodes: {},
            lines: {},
            properties: [],
        };

        let blockData = {
            name: "ROOT",
            type: "SequenceComposite",
            id: generateUUID(),
            root: true
        };
        graphGraphData.nodes[blockData.id] = blockData
        return JSON.stringify(graphGraphData);
    }
    pushGraphData() {
        this.queue.push(JSON.parse(JSON.stringify(this.graphData)))
        if (this.queue.length > 20)
            this.queue.splice(0, 1)
    }

    popGraphData() {
        if (this.queue.length > 0)
            return this.queue.pop()
        return this.graphData
    }

    public setDirty(val: boolean, type?: string) {
        this._dirty = val;
        this.pushGraphData()
        MessageMgr.Instance.send(MessageType.DirtyChanged, val, type);
    }
    public getDirty() {
        return this._dirty;
    }

    private onAssetLoadedBind?: (uuid: string) => void;

    init() {
        this.onAssetLoadedBind = this.onAssetLoaded.bind(this);
        MessageMgr.Instance.register(MessageType.AssetLoaded, this.onAssetLoadedBind);
    }

    release() {
        this.onAssetLoadedBind && MessageMgr.Instance.unregister(MessageType.AssetLoaded, this.onAssetLoadedBind);
    }

    private reset() {
        this.setDirty(false);
    }

    private onAssetLoaded() {
        this.reset();
        this.reload();
    }

    public async restore() {
        this.setDirty(false);

        MessageMgr.Instance.send(MessageType.Restore);
    }

    public setGraphDataByAsset(assetInfo: AssetInfo, asset: string) {
        if (asset) {
            this.graphData = this.validateGraphData(assetInfo, JSON.parse(asset));
        } else {
            console.warn('reload failed, graph data asset is null.');
            return;
        }
    }

    public async reload() {
        this.queue.length = 0
        MaskMgr.Instance.hideAll();
    }

    public syncLastGraphData() {
        this.lastGraphData = JSON.parse(JSON.stringify(this.graphData));
    }

    /**
     * 存储到 Asset 的字符串数据
     */
    public getGraphAssetData(): string {
        return JSON.stringify(this.graphData)
    }

    /**
     * 验证数据
     * @private
     */
    protected validateGraphData(assetInfo: AssetInfo, graphData: GraphData) {
        return graphData;
    }

    public getCurrentGraphData(): GraphData {
        return this.graphData;
    }
}

