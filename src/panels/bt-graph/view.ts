import { GraphObject, TextBlock } from 'gojs';
import { defineComponent, onMounted, onUnmounted, ref } from 'vue/dist/vue.js';
import {
    GraphAssetMgr,
    GraphDataMgr,
    GraphEditorMgr,
    MessageMgr,
    MessageType
} from '../../bt-graph';
import { floatWindowsLogic } from './FloatWindows';
import GojsView from './GojsView';
import Inspector from './inspector';
import MaskComponent from './MaskComponent';

export default defineComponent({
    components: {
        "MaskComponent": MaskComponent,
        "Inspector": Inspector,
        "GojsView": GojsView
    },
    props: {

    },

    setup(props, ctx) {
        // 遮罩逻辑

        const floatWindows = floatWindowsLogic(props, ctx);
        const foregroundRef = ref<HTMLElement>();
        const dragAreaRef = ref<HTMLElement>();
        const shaderGraphRef = ref<HTMLElement>();
        const showCreateNewMenu = ref(false);
        const dirtyRef = ref<HTMLDivElement>();


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
            // 用于获取鼠标的坐标
            GraphEditorMgr.Instance.addMousePointerListener(shaderGraphRef.value);
            MessageMgr.Instance.register(MessageType.DirtyChanged, onDirty);
            GraphAssetMgr.Instance.openAsset();
            GraphDataMgr.Instance.init()
        });

        onUnmounted(() => {
            MessageMgr.Instance.unregister(MessageType.DirtyChanged, onDirty);
        });

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

            onReset,
            onSave,

            showCreateNewMenu,
            onChangeCreateNewMenu,
            ...floatWindows,
        };
    },
});
