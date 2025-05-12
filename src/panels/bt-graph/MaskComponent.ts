import { readFileSync } from 'fs';
import { join } from 'path';
import { defineComponent, onMounted, onUnmounted, ref } from 'vue/dist/vue.js';
import { GraphAssetMgr, MaskMgr, MaskType, MessageMgr, MessageType } from '../../bt-graph';

export default defineComponent({
    name: 'MaskComponent',
    setup(props, ctx) {
        const maskRef = ref();
        const displayMaskType = ref<MaskType>(MaskMgr.Instance.displayMaskType);

        const createNewList = ref([
            {
                type: 'Unlit',
                label: Editor.I18n.t('bt-graph.buttons.new'),
            },
        ]);

        function onUpdateMask(nextMaskType: MaskType) {
            displayMaskType.value = nextMaskType;
            changeMaskDisplay();
        }

        function changeMaskDisplay() {
            if (!maskRef.value) return;

            if (displayMaskType.value === MaskType.None) {
                maskRef.value.removeAttribute('show');
            } else {
                maskRef.value.setAttribute('show', '');
            }
        }

        onMounted(() => {
            changeMaskDisplay();
            MessageMgr.Instance.register(MessageType.UpdateMask, onUpdateMask);
        });

        onUnmounted(() => {
            MessageMgr.Instance.unregister(MessageType.UpdateMask, onUpdateMask);
        });

        async function onSaveAs() {
            GraphAssetMgr.Instance.saveAs().then((done: boolean) => {
                done && MaskMgr.Instance.updateMask();
            });
        }

        async function onCreateNew(type: string) {
            GraphAssetMgr.Instance.createNew(type).then((done: boolean) => {
                done && MaskMgr.Instance.updateMask();
            });
        }

        async function onOpen() {
            GraphAssetMgr.Instance.open().then((done: boolean) => {
                done && MaskMgr.Instance.updateMask();
            });
        }

        async function onReload() {
            GraphAssetMgr.Instance.load().then((done: boolean) => {
                done && MaskMgr.Instance.updateMask();
            });
        }

        async function onOverride() {
            GraphAssetMgr.Instance.save().then((done: boolean) => {
                done && MaskMgr.Instance.updateMask();
            });
        }

        async function onSaveAndReloadByRename() {
            GraphAssetMgr.Instance.save().then(() => {
                GraphAssetMgr.Instance.load().then((done) => {
                    done && MaskMgr.Instance.updateMask();
                });
            });
        }

        async function onCancel() {
            MaskMgr.Instance.updateMask();
        }

        return {
            onOpen,
            onSaveAs,
            onCreateNew,
            onReload,
            onOverride,
            onCancel,
            onSaveAndReloadByRename,

            maskRef,
            createNewList,

            // mask
            MaskType,
            displayMaskType,
        };
    },

    template: readFileSync(join(__dirname, '../../../static/bt-graph/mask.html'), 'utf-8'),
});