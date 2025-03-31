import { AssetInfo } from "@cocos/creator-types/editor/packages/asset-db/@types/public";
import { Blackboard } from "../../runtime/BehaviorTree/Base/BTBlackboard";
import { IBTNodesData } from "../../runtime/BehaviorTree/Base/BTResource";
import { BTType } from "../../runtime/BehaviorTree/Base/BTType";
import { graphAssetMgr } from "../GraphAssetMgr";
import { messageMgr } from "../MessageMgr";
import { MsgType } from "../MsgType";
import { Layout } from "./Layout";


export class GraphDataMgr {
    public assetUuid = '';
    public assetData = '';
    public assetInfo: AssetInfo | null = null;
    btTree: IBTNodesData = { nodes: [], edges: [], blackBoard: new Blackboard() }

    static instance = null
    static getInstance(): GraphDataMgr {
        if (GraphDataMgr.instance)
            return GraphDataMgr.instance

        return new GraphDataMgr()
    }

    async InitMsg() {
        messageMgr.register(MsgType.CreateNewGraphAsset, () => {
            graphAssetMgr.createNew("New BT Graph Asset", ["btgraph"], () => {
                return this.createDefaultData()
            }, (assetInfo, data) => {
                console.log("createNew callback")
                this.initPanel(assetInfo, data)
            })
        })
        messageMgr.register(MsgType.OpenGraphSource, () => {
            graphAssetMgr.open("New BT Graph Asset", ["btgraph"], (assetInfo, data) => {
                console.log("open callback")
                this.initPanel(assetInfo, data)
            })
        })

        messageMgr.register(MsgType.SaveGraphAssetAs, () => {
            graphAssetMgr.saveAs(this.assetInfo, "New BT Graph Asset", ["btgraph"], JSON.stringify(this.btTree), (assetInfo, data) => {
                console.log("saveAs callback")
                this.initPanel(assetInfo, data)
            })
        })

        messageMgr.register(MsgType.SaveGraphAsset, () => {
            console.log("save callback")
            graphAssetMgr.save(this.assetInfo, JSON.stringify(this.btTree))
        })

        messageMgr.register(MsgType.CreateNode, this.CreateNode.bind(this))
        messageMgr.register(MsgType.DelNode, this.DelNode.bind(this))
    }

    initPanel(assetInfo, data) {
        if (!assetInfo || !data) return
        this.assetInfo = assetInfo
        this.assetUuid = assetInfo.uuid

        this.btTree = JSON.parse(data)
        messageMgr.send(MsgType.InitBTPanel, this.btTree)
    }

    createDefaultData() {
        let defaultData: IBTNodesData = {
            nodes: [{
                id: Editor.Utils.UUID.generate(),
                type: "input",
                root: true,
                position: { x: 0, y: 0 },
                data: { label: "Root" },
                className: "SelectorCompositeNode"
            }],
            edges: [],
        }
        defaultData.nodes = Layout.doLayout(defaultData.nodes, defaultData.edges, "TB")
        let content = JSON.stringify(defaultData)
        return content
    }

    CreateNode(fatherId: string, type: BTType, className?: string) {
        let findIndex = this.btTree.nodes.findIndex(value => value.id === fatherId)
        if (findIndex < 0) return

        let node = {
            id: Editor.Utils.UUID.generate(),
            type: "default",
            root: false,
            position: { x: 0, y: 0 },
            data: { label: "" },
            className: className
        }

        node.type = (type != BTType.Action && type != BTType.Condition) ? "default" : "output"
        node.data = { label: className }

        let edge = {
            id: Editor.Utils.UUID.generate(),
            source: fatherId,
            target: node.id,
        }

        this.btTree.nodes.push(node)
        this.btTree.edges.push(edge)

        this.btTree.nodes = Layout.doLayout(this.btTree.nodes, this.btTree.edges, "TB")
        messageMgr.send(MsgType.InitBTPanel, this.btTree)
    }

    DelNode(id) {
        let [nodes, edges] = [new Set<string>(), new Set<string>()]

        this.FindDelInfo(id, nodes, edges)

        for (const element of nodes) {
            let findIndex = this.btTree.nodes.findIndex(value => value.id === element)
            if (findIndex >= 0) {
                this.btTree.nodes.splice(findIndex, 1)
            }
        }

        for (const element of edges) {
            let findIndex = this.btTree.edges.findIndex(value => value.id === element)
            if (findIndex >= 0) {
                this.btTree.edges.splice(findIndex, 1)
            }
        }

        this.btTree.nodes = Layout.doLayout(this.btTree.nodes, this.btTree.edges, "TB")
        messageMgr.send(MsgType.InitBTPanel, this.btTree)
    }

    FindDelInfo(id, nodeIds: Set<string>, edgeIds: Set<string>) {
        for (const element of this.btTree.edges) {
            if (element.source == id) {
                this.FindDelInfo(element.target, nodeIds, edgeIds)
            }
        }

        for (let index = this.btTree.edges.length - 1; index >= 0; index--) {
            if (this.btTree.edges[index].target == id) {
                edgeIds.add(this.btTree.edges[index].id)
            }
        }
        nodeIds.add(id)
    }

}
