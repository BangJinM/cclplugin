import { defineComponent, onMounted, onUnmounted, ref } from 'vue/dist/vue.js';

import { Diagram, InputEvent, Link, Node, Routing, Shape, TextBlock, TreeLayout, TreeModel } from 'gojs';
import {
    GraphAssetMgr,
    GraphDataMgr,
    GraphEditorMgr,
    MessageMgr,
    MessageType
} from '../../shader-graph';
import { floatWindowsLogic } from './float-windows';
import { maskLogic } from './mask';

export default defineComponent({

    props: {

    },

    setup(props, ctx) {
        // 遮罩逻辑
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

        onMounted(() => {
            const myDiagram = new Diagram(logicFlowRef.value,
                {
                    "undoManager.isEnabled": true,
                    layout: new TreeLayout({ angle: 90, layerSpacing: 35 })
                });
            myDiagram.click = (e: InputEvent) => { }
            myDiagram.nodeTemplate =
                new Node("Horizontal",
                    { background: "#44CCFF" })
                    .add(
                        new TextBlock("Default Text",
                            { margin: 12, stroke: "white", font: "bold 16px sans-serif" })
                            .bind("text", "name")
                    );

            // define a Link template that routes orthogonally, with no arrowhead
            myDiagram.linkTemplate =
                new Link(
                    { routing: Routing.Orthogonal, corner: 5 })
                    .add(
                        new Shape({ strokeWidth: 3, stroke: "#555" }),
                    );

            // it's best to declare all templates before assigning the model
            myDiagram.model = new TreeModel(
                [
                    { key: "1", name: "Don Meow", source: "cat1.png" },
                    { key: "2", parent: "1", name: "Demeter", source: "cat2.png" },
                    { key: "3", parent: "1", name: "Copricat", source: "cat3.png" },
                    { key: "4", parent: "3", name: "Jellylorum", source: "cat4.png" },
                    { key: "5", parent: "4", name: "Alonzo", source: "cat5.png" },
                    { key: "6", parent: "5", name: "Munkustrap", source: "cat6.png" }
                ]);
            MessageMgr.Instance.register(MessageType.DirtyChanged, onDirty);
            MessageMgr.Instance.register(MessageType.DraggingProperty, onDrag);
            GraphAssetMgr.Instance.openAsset();
            GraphDataMgr.Instance.init()
        });

        onUnmounted(() => {
            MessageMgr.Instance.unregister(MessageType.DirtyChanged, onDirty);
            MessageMgr.Instance.unregister(MessageType.DraggingProperty, onDrag);
        });

        function onReset() {
            GraphDataMgr.Instance.restore();
        }

        function onSave() {
            GraphAssetMgr.Instance.save();
        }

        function onDrag() {
            foregroundRef.value?.removeAttribute('disallowed-event');
            dragAreaRef.value?.removeAttribute('disallowed-event');
        }

        function onDragEnd(event: DragEvent) {
            foregroundRef.value?.setAttribute('disallowed-event', '');
            dragAreaRef.value?.setAttribute('disallowed-event', '');
            const value = event.dataTransfer?.getData('value');
            const options = value && JSON.parse(value);
            if (options) {
                const { x, y } = GraphEditorMgr.Instance.convertsMousePoint(event.x, event.y - 28);
                options.x = x;
                options.y = y;
                GraphEditorMgr.Instance.add(options);
            }
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

            onDragEnd,

            showCreateNewMenu,
            onChangeCreateNewMenu,

            ...mask,
            ...floatWindows,
        };
    },
});
