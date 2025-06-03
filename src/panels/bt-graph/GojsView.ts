import go from 'gojs';
import { defineComponent, onMounted, onUnmounted, ref } from 'vue/dist/vue.js';
import { GraphAssetMgr, GraphDataMgr, MessageMgr, MessageType } from '../../bt-graph';
import { GraphNodeMgr } from '../../bt-graph/base/graph-node-mgr';

export default defineComponent({
    name: 'GojsView',
    setup(props, ctx) {
        const logicFlowRef = ref<HTMLElement>();
        let myDiagram: go.Diagram = null;

        function mouseEnter(e, obj) {
            var shape = obj.findObject("SHAPE");
            shape.fill = "#6DAB80";
            shape.stroke = "#A6E6A1";
            var text = obj.findObject("TEXT");
            text.stroke = "white";
        };

        function mouseLeave(e, obj) {
            var shape = obj.findObject("SHAPE");
            shape.fill = obj.data.color;
            shape.stroke = null;
            var text = obj.findObject("TEXT");
            text.stroke = "black";
        };

        function onSelectionChanged(node) {
            console.log(node.data)
            MessageMgr.Instance.send(MessageType.SelectNodeChange, node.key)
        }


        // To simplify this code we define a function for creating a context menu button:
        function makeButton(text, action) {
            const obj = go.GraphObject.build('ContextMenuButton', {
                click: action
            }).add(new go.TextBlock(text));
            return obj;
        }

        onMounted(() => {
            myDiagram = new go.Diagram(logicFlowRef.value,
                {
                    layout: new go.TreeLayout({ angle: 90, layerSpacing: 35 }),
                });
            myDiagram.nodeTemplate =
                new go.Node("Auto",
                    {
                        background: "#44CCFF",
                        mouseEnter: mouseEnter,
                        mouseLeave: mouseLeave,
                        selectionChanged: onSelectionChanged,
                        fromSpot: go.Spot.Bottom,
                        toSpot: go.Spot.Top,
                        fromLinkable: true,
                        toLinkable: true,
                    })
                    .add(
                        new go.Shape("Rectangle", { strokeWidth: 2, stroke: null, name: "SHAPE" }).bind("fill", "color"),
                        new go.Panel("Table").add(
                            new go.TextBlock("Default Text",
                                {
                                    margin: 10, font: "bold 18px Verdana", name: "TEXT", editable: false, row: 0
                                })
                                .bind("text", "type"),
                            new go.TextBlock("Default Text",
                                {
                                    margin: 10, font: "bold 18px Verdana", name: "TEXT", editable: true, row: 1
                                })
                                .bind("text", "name")
                        )
                    );

            // define a Link template that routes orthogonally, with no arrowhead
            myDiagram.linkTemplate =
                new go.Link(
                    {
                        routing: go.Routing.Orthogonal,
                        corner: 5,
                    })
                    .add(
                        new go.Shape({ strokeWidth: 3, stroke: "#61f5f5" }),
                    );
            myDiagram.nodeTemplate.contextMenu = go.GraphObject.build('ContextMenu')
                .add(
                    makeButton('Add', (e, obj) => {
                        var contextmenu = obj.part;
                        var nodedata = contextmenu.data;
                        console.log(nodedata)
                        MessageMgr.Instance.send(MessageType.ShowCreateNodeWindow, nodedata.key);
                    }),
                    makeButton('Delete', (e, obj) => {
                        var contextmenu = obj.part;
                        var nodedata = contextmenu.data;
                        console.log(nodedata)
                        GraphNodeMgr.Instance.removeNode(nodedata.key)
                    }).bind(new go.Binding("visible", "", (value) => {
                        return !value.root
                    })),
                );

            myDiagram.grid.visible = true;
            myDiagram.grid.gridCellSize = new go.Size(50, 40);
            myDiagram.animationManager.isEnabled = false
            myDiagram.toolManager.linkingTool.isValidLink = (fromnode: go.Node, fromport: go.GraphObject, tonode: go.Node, toport: go.GraphObject) => {
                return fromnode.data["key"] != tonode.data["key"] && !tonode.data["root"]
            }

            myDiagram.addDiagramListener("LinkDrawn", function (e) {
                const link = e.subject;
                console.log("连线完成",
                    "源:", link.fromNode.key,
                    "目标:", link.toNode.key,
                    "连接数据:", link.data);
                GraphNodeMgr.Instance.upateLink(link.fromNode.key, link.toNode.key)
            });

            myDiagram.toolManager.textEditingTool.isValidText = (textblock: go.TextBlock, oldstr: string, newstr: string) => {
                if (newstr.length <= 0)
                    return false
                return true
            }
            myDiagram.toolManager.textEditingTool.doSuccess = (oldstring: string, newstring: string) => {
                let textBlock = myDiagram.toolManager.textEditingTool.textBlock
                if (!textBlock) return

                let data = myDiagram.toolManager.textEditingTool.textBlock?.part?.data
                if (data) {
                    let newData = GraphNodeMgr.Instance.getNodeByID(data.key)
                    newData.name = newstring

                    GraphNodeMgr.Instance.updateNode(data.key, newData)
                }
            }

            MessageMgr.Instance.register(MessageType.AssetLoaded, onAssetLoaded)
            MessageMgr.Instance.register(MessageType.GraphNodeChange, onGraphNodeChange)
            GraphAssetMgr.Instance.openAsset();
            GraphDataMgr.Instance.init()
        });

        onUnmounted(() => {
            MessageMgr.Instance.unregister(MessageType.AssetLoaded, onAssetLoaded)
            MessageMgr.Instance.unregister(MessageType.GraphNodeChange, onGraphNodeChange)
        });

        function onAssetLoaded() {
            onGraphNodeChange()
        }

        function onGraphNodeChange() {
            let data = GraphDataMgr.Instance.getCurrentGraphData()
            let nodes = []
            for (const key in data.nodes) {
                nodes.push({
                    key: key,
                    name: data.nodes[key].name,
                    root: data.nodes[key].root,
                    type: data.nodes[key].type,
                    color: "#96D6D9"
                })
            }
            let edges = []
            for (const key in data.lines) {
                edges.push({
                    from: data.lines[key].source, to: data.lines[key].target, key: key
                })
            }
            myDiagram.model = new go.GraphLinksModel(nodes, edges);
        }

        return {
            logicFlowRef
        };
    },

    template: `<div id="ui-logic-flow" class="foreground" ref="logicFlowRef"></div>`,
});