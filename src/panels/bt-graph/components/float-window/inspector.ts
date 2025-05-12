import { debounce } from 'lodash';

import type { PropertyDefine } from '../../../../../@types/bt-node-type';

import {
    getPropertyDefineByType,
    GraphEditorMgr,
    GraphPropertyMgr,
    MessageMgr,
    MessageType
} from '../../../../bt-graph';

import { defineComponent, nextTick, ref } from 'vue/dist/vue.js';
import { GraphNodeMgr } from '../../../../bt-graph/base/graph-node-mgr';

export interface PropertyItem {
    /** 类型 */
    type: string,
    /** 名字 */
    name: string,
    /** 对应的key */
    propertyKey: string,
    [key: string]: any
}

export default defineComponent({
    name: 'Inspector',
    setup(props, ctx) {
        const loading = ref(false);
        const popupMenuRef = ref(false);
        const menusRef = ref<{ label: string; data: { [key: string]: any } }[]>([]);
        const propertyRefs = ref<PropertyItem[]>([]);
        const menuNodeRef = ref()

        const propertyMap: Map<string, PropertyItem> = new Map();

        let selectNodeId = null
        let selectPropertyName = ""

        // 用于隐藏 menu
        function onFullscreenMouseUp() {
            if (popupMenuRef.value) {
                setTimeout(() => {
                    popupMenuRef.value = false;
                    document.removeEventListener('mouseup', onFullscreenMouseUp);
                }, 10);
            }
        }

        MessageMgr.Instance.register([MessageType.SelectNodeChange, MessageType.BlackBoardPropertyChange], (id: string) => {
            if (id) selectNodeId = id
            if (!selectNodeId) return
            updatePropertiesDebounce();
        });

        function updateMenuByShaderPropertyDefines(type: string) {
            menusRef.value = [];
            GraphPropertyMgr.Instance.iterateProperties((property, propertyDefine) => {
                if (property.type == type) {
                    menusRef.value.push({
                        label: property.name,
                        data: property
                    });
                }
            })
        }

        async function createPropertyItem(propertyData?: { name: string, type: string }) {
            if (!propertyData) {
                console.debug('data undefined or define ', propertyData);
                return;
            }
            let define = getPropertyDefineByType(propertyData.type)
            let node = GraphNodeMgr.Instance.getNodeByID(selectNodeId)
            let value = define.value
            let propertyKey = ""
            if (node && node.properties && node.properties[propertyData.name]) {
                let tp = GraphPropertyMgr.Instance.getPropertyByID(node.properties[propertyData.name])
                if (tp.value) value = tp.value
                propertyKey = tp.name
            }
            const valueDump = await MessageMgr.Instance.callSceneMethod('queryPropertyValueDumpByType', [
                propertyData.type, value
            ]);

            const propertyItem: PropertyItem = {
                valueDump: valueDump,
                propertyKey: propertyKey,
                ...propertyData,
            };

            propertyMap.set(propertyData.name, propertyItem);
            return propertyItem;
        }

        async function updateProperties() {
            if (!selectNodeId) return
            loading.value = true;

            propertyMap.clear();

            let node = GraphNodeMgr.Instance.getNodeByID(selectNodeId)

            const propertyList = await MessageMgr.Instance.callSceneMethod('queryBTNodeProperty', [node.type]);
            let properties: Map<string, PropertyDefine> = new Map(propertyList);
            for (const [name, property] of properties) {
                await createPropertyItem(property);
            }

            propertyRefs.value = [];
            propertyMap.forEach((item: PropertyItem) => {
                propertyRefs.value.push(item);
            });
            loading.value = false;
        }

        const updatePropertiesDebounce = debounce(async () => {
            await updateProperties();
        }, 100);

        MessageMgr.Instance.register([
            MessageType.EnterGraph,
            MessageType.Restore,
            MessageType.SetGraphDataToForge,
        ], () => {
            updatePropertiesDebounce();
        });


        async function onShowMenu(variable) {
            selectPropertyName = variable.name
            let y = GraphEditorMgr.Instance.mousePointInPanel.y;


            popupMenuRef.value = true
            await updateMenuByShaderPropertyDefines(variable.type)
            document.addEventListener('mouseup', onFullscreenMouseUp);

            nextTick(() => {
                menuNodeRef.value.style.top = `${y}px`
            })
        }

        function onRender(value: any) {
            return JSON.stringify(value);
        }

        function addProperty(data) {
            GraphNodeMgr.Instance.setNodeProperty(selectNodeId, selectPropertyName, data.id)
            popupMenuRef.value = false
            updatePropertiesDebounce()
        }

        return {
            loading,

            propertyRefs,
            menusRef,
            popupMenuRef,
            menuNodeRef,

            onRender,
            onShowMenu,
            addProperty
        };
    },

    template: `
<div class="graph-inspector">
    <div class="title">
        <ui-label>inspector</ui-label>
    </div>
    <div class="property-contents">
        <div class="item" v-for="(property, index) in propertyRefs" :key="property.name + '' + index">
            <div class="prop">
                <ui-label class="label" :value="property.name"></ui-label>
                <ui-input class="content" :value="property.propertyKey" @click="onShowMenu(property)"></ui-input>
            </div>
            <ui-prop no-label class="dump-value" type="dump" :render="onRender(property.valueDump)" readonly> </ui-prop>
        </div>
    </div>
    <div ref="menuNodeRef" class="property-menu" v-if="popupMenuRef">
        <ui-label class="option" v-for="(menu, index) in menusRef" :key="menu.label + '' + index" :value="menu.label"
            @click.stop="addProperty(menu.data)"></ui-label>
    </div>
    <ui-loading class="loading" v-show="loading"></ui-loading>
</div>
    `,
});