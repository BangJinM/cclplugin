import go, { Binding, Diagram, GraphLinksModel, GraphObject, Link, Node, Routing, Shape, TextBlock, TreeLayout } from 'gojs';
import { defineComponent, onMounted, onUnmounted, ref } from 'vue/dist/vue.js';
import {
    GraphAssetMgr,
    GraphDataMgr,
    GraphEditorMgr,
    MessageMgr,
    MessageType
} from '../../bt-graph';
import { GraphNodeMgr } from '../../bt-graph/base/graph-node-mgr';
import { floatWindowsLogic } from './FloatWindows';
import Inspector from './components/float-window/inspector';
import { maskLogic } from './mask';

export default defineComponent({
    components: {
        Inspector,
    },
    props: {

    },

    setup(props, ctx) {
        // 遮罩逻辑
        let myDiagram: Diagram = null;
        const mask = maskLogic(props, ctx);
        const floatWindows = floatWindowsLogic(props, ctx);

        const showCreateNewMenu = ref(false);
        const dirtyRef = ref<HTMLDivElement>();
        const shaderGraphRef = ref<HTMLElement>();
        const foregroundRef = ref<HTMLElement>();
        const dragAreaRef = ref<HTMLElement>();
        const logicFlowRef = ref<HTMLElement>();

        function onDirty(dirty: boolean) {
            if (dirty) {
                dirtyRef.value?.removeAttribute('hidden');
            } else {
                dirtyRef.value?.setAttribute('hidden', '');
            }
        }

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
            const obj = GraphObject.build('ContextMenuButton', {
                click: action
            }).add(new TextBlock(text));
            return obj;
        }

        onMounted(() => {
            myDiagram = new Diagram(logicFlowRef.value,
                {
                    "undoManager.isEnabled": true,
                    layout: new TreeLayout({ angle: 90, layerSpacing: 35 }),
                });
            myDiagram.nodeTemplate =
                new Node("Auto",
                    {
                        background: "#44CCFF",
                        mouseEnter: mouseEnter,
                        mouseLeave: mouseLeave,
                        selectionChanged: onSelectionChanged
                    })
                    .add(
                        new Shape("Rectangle", { strokeWidth: 2, stroke: null, name: "SHAPE" }).bind("fill", "color")
                    )
                    .add(
                        new TextBlock("Default Text",
                            { margin: 10, font: "bold 18px Verdana", name: "TEXT" })
                            .bind("text", "name")
                    );

            // define a Link template that routes orthogonally, with no arrowhead
            myDiagram.linkTemplate =
                new Link(
                    { routing: Routing.Orthogonal, corner: 5 })
                    .add(
                        new Shape({ strokeWidth: 3, stroke: "#61f5f5" }),
                    );

            myDiagram.nodeTemplate.contextMenu = GraphObject.build('ContextMenu')
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
                    }).bind(new Binding("visible", "", (value) => {
                        return !value.root
                    })),
                );

            myDiagram.grid.visible = true;
            myDiagram.grid.gridCellSize = new go.Size(50, 40);
            myDiagram.animationManager.isEnabled = false
            myDiagram.toolManager.draggingTool.isEnabled = false
            myDiagram.toolManager.linkingTool.isEnabled = false

            // 用于获取鼠标的坐标
            GraphEditorMgr.Instance.addMousePointerListener(shaderGraphRef.value);

            MessageMgr.Instance.register(MessageType.DirtyChanged, onDirty);
            MessageMgr.Instance.register(MessageType.AssetLoaded, onAssetLoaded)
            MessageMgr.Instance.register(MessageType.GraphNodeChange, onGraphNodeChange)
            GraphAssetMgr.Instance.openAsset();
            GraphDataMgr.Instance.init()
        });

        onUnmounted(() => {
            MessageMgr.Instance.unregister(MessageType.DirtyChanged, onDirty);
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
                    color: "#96D6D9"
                })
            }
            let edges = []
            for (const key in data.lines) {
                edges.push({
                    from: data.lines[key].source, to: data.lines[key].target, key: key
                })
            }
            myDiagram.model = new GraphLinksModel(nodes, edges);
        }

        function onReset() {
            GraphDataMgr.Instance.restore();
        }

        function onSave() {
            GraphAssetMgr.Instance.save();
        }

        function onChangeCreateNewMenu(show: boolean) {
            showCreateNewMenu.value = show;
        }

        return {
            dirtyRef,
            foregroundRef,
            dragAreaRef,
            shaderGraphRef,
            logicFlowRef,

            onReset,
            onSave,

            showCreateNewMenu,
            onChangeCreateNewMenu,

            ...mask,
            ...floatWindows,
        };
    },
});
