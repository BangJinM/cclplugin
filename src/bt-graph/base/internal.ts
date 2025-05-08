import { generateUUID } from '../utils';

export enum MaskType {
    None = 0,
    /**
     * 等待加载
     */
    WaitLoad = 1,
    /**
     * 资源发生变化的时候
     */
    AssetChange = 10,
    /**
     * 资源丢失
     */
    AssetMissing = 30,
    /**
     * 没有选择 shader graph 时，需要提示用户去创建
     */
    NeedCreateNewAsset = 50,
    /**
     * 是否需要保存并重新加载
     */
    NeedSaveBeReloadByRename = 51,
    /**
     * 等待场景加载完成
     */
    WaitSceneReady = 100,
}

/**
 * 用于添加 block 属性
 */
export interface GraphEditorAddOptions {
    path: string;
    type: string;
    value: string;
}
export interface NodeData {
    name: string;
    type: string;
    root: boolean;
    properties?: { [name: string]: string };
}

export interface LineData {
    source: string;
    target: string;
}

/**
 * 用存储 Graph Property 数据
 */
export class PropertyData {
    id: string = generateUUID();
    type = '';
    name = '';
    value: any;
}


// Graph 的序列化数据
export interface GraphData<D extends Object = { [key: string]: any; }> {
    name?: string,
    nodes: {
        [uuid: string]: NodeData;
    };
    lines: {
        [uuid: string]: LineData;
    };
    properties: PropertyData[]
}

/**
 * 其他存储数据例如拷贝，粘贴
 */
export interface GraphEditorOtherOptions {
    uuid: string;
    lineData?: LineData;
    blockData?: NodeData;
}

export enum MessageType {

    // --- assets ---
    AssetLoaded = 'asset-loaded',

    SceneReady = 'scene-ready',
    SceneClose = 'scene-closed',

    EnterGraph = 'enter-graph',

    SetGraphDataToForge = 'set-graph-data-to-forge',
    Restore = 'restore',
    Loaded = 'load-completed',
    Declared = 'declare-completed',
    Dirty = 'dirty',
    DirtyChanged = 'dirty-changed',
    DraggingProperty = 'dragging-property',
    GraphNodeChange = "graph-node-change",

    SelectNodeChange = "select-node-change",

    // mask
    UpdateMask = 'update-mask',

    // menu
    ShowCreateNodeWindow = 'show-create-node',
    CreateMenuChange = 'create-menu-change',

    // float window
    FloatWindowConfigChanged = 'float-window-config-changed',

    // window
    Resize = 'resize',
}

export interface IFloatWindowConfig {
    position?: {
        top?: string;
        left?: string;
        right?: string;
        bottom?: string;
    }

    show?: boolean;
    width?: string;
    height?: string;

    [key: string]: any;
}

export interface IFloatWindowConfigs {
    [name: string]: IFloatWindowConfig,
}

export interface IGraphConfig {
    offset: { x: number, y: number },
    scale: number,
    floatWindows: IFloatWindowConfigs,
}

export interface IGraphConfigs {
    [uuid: string]: IGraphConfig
}
