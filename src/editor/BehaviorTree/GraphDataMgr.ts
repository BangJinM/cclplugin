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

    selectNodeId: string;

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

        messageMgr.register(MsgType.AddNode, this.OnAddNode.bind(this))
        messageMgr.register(MsgType.SelectNode, this.OnSelectNode.bind(this))
    }

    initPanel(assetInfo, data) {
        if (!assetInfo || !data) return
        this.assetInfo = assetInfo
        this.assetUuid = assetInfo.uuid

        this.btTree = JSON.parse(data)
        this.selectNodeId = this.btTree.nodes[0]?.id
        messageMgr.send(MsgType.InitBTPanel, this.btTree, this.selectNodeId)
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

    OnAddNode(type: BTType, className: string) {
        let node = {
            id: Editor.Utils.UUID.generate(),
            type: "default",
            root: true,
            position: { x: 0, y: 0 },
            data: { label: "" },
            className: className
        }

        if (this.btTree.nodes.length <= 0) {
            node.type = "input"
            node.data = { label: "ROOT" }
        } else {
            node.type = (type != BTType.Action && type != BTType.Condition) ? "default" : "output"
            node.data = { label: className }
        }

        let edge = {
            id: Editor.Utils.UUID.generate(),
            source: this.selectNodeId,
            target: node.id,
        }

        this.btTree.nodes.push(node)
        this.btTree.edges.push(edge)

        this.btTree.nodes = Layout.doLayout(this.btTree.nodes, this.btTree.edges, "TB")
        messageMgr.send(MsgType.InitBTPanel, this.btTree)
    }

    OnSelectNode(id: string) {
        this.selectNodeId = id
    }
}
