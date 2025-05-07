
import { generateUUID } from '../utils';
import { GraphDataMgr, GraphEditorAddOptions, MessageMgr, MessageType, NodeData, PropertyData } from './index';

/**
 * 用于处理 Node
 */
export class GraphNodeMgr {

    static _instance: GraphNodeMgr | null = null;

    public static get Instance(): GraphNodeMgr {
        if (!this._instance) {
            this._instance = new GraphNodeMgr();
        }
        return this._instance;
    }

    public getNodeByID(id: string) {
        const currentGraphData = GraphDataMgr.Instance.getCurrentGraphData();
        return currentGraphData.nodes[id]
    }

    public exitsNode(name: string): boolean {
        const currentGraphData = GraphDataMgr.Instance.getCurrentGraphData();
        return currentGraphData.nodes[name] ? true : false
    }

    public createNode(options: GraphEditorAddOptions): NodeData {
        return {
            name: options.value,
            type: options.value,
            root: false
        }
    }

    public addNode(node: NodeData, parentId: string): PropertyData {
        const currentGraphData = GraphDataMgr.Instance.getCurrentGraphData();

        let parentNode = currentGraphData.nodes[parentId]
        if (!parentNode)
            return

        let nodeId = generateUUID()
        currentGraphData.nodes[nodeId] = node
        currentGraphData.lines[generateUUID()] = {
            source: parentId,
            target: nodeId
        }
        GraphDataMgr.Instance.setDirty(true);
        MessageMgr.Instance.send(MessageType.GraphNodeChange)
    }

    public removeNode(key: string) {
        const currentGraphData = GraphDataMgr.Instance.getCurrentGraphData();

        let deleteChild = (childKey) => {
            for (const element in currentGraphData.lines) {
                let value = currentGraphData.lines[element]

                if (value.source == childKey) {
                    deleteChild(value.target)
                }
            }

            for (const element in currentGraphData.lines) {
                let value = currentGraphData.lines[element]

                if (value.target == childKey) {
                    delete currentGraphData.lines[element]
                }
            }
            delete currentGraphData.nodes[childKey]
        }
        deleteChild(key)
        GraphDataMgr.Instance.setDirty(true);
        MessageMgr.Instance.send(MessageType.GraphNodeChange)
    }
}
