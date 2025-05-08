import * as cc from "cc";
import { Blackboard } from "./BTBlackboard";
import { btTreeClassMap, IBTTreeClass } from "./BTClass";
import { BTNode } from "./BTNode";
import { IBTEdgeData, IBTNodeData, IBTNodesData } from "./BTResource";
const { ccclass, property, requireComponent } = cc._decorator;
@ccclass("BTComponent")
export class BTComponent extends cc.Component implements IBTNodesData {
    nodes: IBTNodeData[] = [];
    edges: IBTEdgeData[] = [];
    blackBoard?: Blackboard = new Blackboard();
    treeNodeMap: Map<string, BTNode> = new Map()
    rootNode: BTNode = null

    @property(cc.JsonAsset)
    jsonAsset: cc.JsonAsset = null

    protected onLoad(): void {
        this.buildTree(this.jsonAsset.json)
    }

    protected start(): void {

    }

    protected update(dt: number): void {
        this.rootNode?.Tick(dt)
    }

    buildTree(obj: Record<string, any>) {
        let rootNodeId: string = ""
        const nodesDataMap: Map<string, IBTNodeData> = new Map();
        if (obj.nodes) {
            for (const node of obj.nodes) {
                nodesDataMap.set(node.id, node);
                if (node.root) {
                    rootNodeId = node.id
                }
            }

            this.nodes = obj.nodes
        }

        const edgesDataMap: Map<string, IBTEdgeData> = new Map();
        if (obj.edges) {
            for (const edge of obj.edges) {
                edgesDataMap.set(edge.id, edge);
            }

            this.edges = this.edges
        }

        this.blackBoard = new Blackboard()
        if (obj.blackBoard) {
            for (const element of obj.blackBoard) {
                this.blackBoard.Add(element.key, element.value)
            }
        }

        this.treeNodeMap = new Map<string, BTNode>()
        nodesDataMap.forEach((value: IBTNodeData, key) => {
            let treeClass: IBTTreeClass = btTreeClassMap.get(value.className)
            this.treeNodeMap.set(value.id, Reflect.construct(treeClass.func, []))
        })

        edgesDataMap.forEach((value) => {
            let sourceNode = this.treeNodeMap.get(value.source)
            let targetNode = this.treeNodeMap.get(value.target)

            if (sourceNode && targetNode) {
                sourceNode.AddNode(targetNode)
            }
        })

        this.rootNode = this.treeNodeMap.get(rootNodeId)
    }

    AddNodeData(nodeData: IBTNodeData, edgeData: IBTEdgeData) {
        let treeClass: IBTTreeClass = btTreeClassMap.get(nodeData.className)
        this.treeNodeMap.set(nodeData.id, treeClass.func())
        this.treeNodeMap.get(nodeData.id)?.SetName(nodeData.id)

        let sourceNode = this.treeNodeMap.get(edgeData.source)
        let targetNode = this.treeNodeMap.get(edgeData.target)

        if (sourceNode && targetNode) {
            sourceNode.AddNode(targetNode)
        }
    }

    DelNodeData(id: string) {
        let node = this.treeNodeMap.get(id)
        if (!node) return

        for (const element of node.mChildren) {
            this.DelNodeData(element.GetName())
        }

        this.treeNodeMap.delete(id)
        for (let index = this.edges.length - 1; index >= 0; index--) {
            if (this.edges[index].target == id || this.edges[index].source == id) {
                this.edges.splice(index, 1)
            }
        }
    }
}