

import { AssetInfo } from '@cocos/creator-types/editor/packages/asset-db/@types/public';
import { generateUUID } from '../utils';
import { BaseMgr, GraphConfigMgr, GraphData, MaskMgr, MessageMgr, MessageType, PropertyData } from './index';

/**
 * 用于处理 shader-graph 数据
 */
export class GraphDataMgr extends BaseMgr {

    static _instance: GraphDataMgr | null = null;

    public static get Instance(): GraphDataMgr {
        if (!this._instance) {
            this._instance = new GraphDataMgr();
        }
        return this._instance;
    }

    public static async createDefaultShaderGraph(graphName = 'New Shader Graph') {
        const graphGraphData: GraphData = {
            name: graphName,
            nodes: {},
            lines: {},
            properties: [],
            details: {
                properties: [],
            },
        };

        let blockData = {
            name: "ROOT",
            type: "SequenceCompositeNode",
            id: generateUUID()
        };
        graphGraphData.nodes[blockData.id] = blockData
        return JSON.stringify(graphGraphData);
    }

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
        details: {
            properties: [],
        },
    };


    public setDirty(val: boolean, type?: string) {
        this._dirty = val;
        MessageMgr.Instance.send(MessageType.DirtyChanged, val, type);
    }
    public getDirty() {
        return this._dirty;
    }

    private onAssetLoadedBind?: (uuid: string) => void;
    private onDirtyDebounce?: (event: Event) => void;
    private onEnterGraphBind?: () => void;

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

    private onDirty(event: Event) {
        GraphConfigMgr.Instance.autoSave().then(() => { });
        const customEvent = event as CustomEvent;
        this.setDirty(true, customEvent && customEvent.detail?.dirtyType);
    }

    public onEnterGraph() {

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
        MaskMgr.Instance.hideAll();
    }

    public syncLastGraphData() {
        this.lastGraphData = JSON.parse(JSON.stringify(this.graphData));
    }

    /**
     * 存储到 Asset 的字符串数据
     */
    public getGraphAssetData(): string {
        return ""
    }

    /**
     * 还原成原始节点
     * @private
     */
    public reduceToBaseNode(property: PropertyData) {

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

