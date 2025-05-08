import { debounce } from 'lodash';

import type { IProperty } from '@cocos/creator-types/editor/packages/scene/@types/public';
import type { PropertyDefine } from '../../../../../@types/bt-node-type';

import {
    getPropertyDefineByType,
    GraphPropertyMgr,
    iteratePropertyDefines,
    MessageMgr,
    MessageType
} from '../../../../bt-graph';

import { defineComponent, ref } from 'vue/dist/vue.js';
import { GraphNodeMgr } from '../../../../bt-graph/base/graph-node-mgr';

export interface PropertyItem {
    type: string,
    name: string,
    [key: string]: any
}

export const component = defineComponent({
    setup(props, ctx) {
        const loading = ref(false);
        const popupMenuRef = ref(false);
        const menusRef = ref<{ label: string; data: PropertyDefine }[]>([]);
        const propertyRefs = ref<PropertyItem[]>([]);

        const propertyMap: Map<string, PropertyItem> = new Map();

        let selectId = null

        MessageMgr.Instance.register(MessageType.SelectNodeChange, (id: string) => {
            selectId = id
            updatePropertiesDebounce();
        });

        function updateMenuByShaderPropertyDefines() {
            menusRef.value = [];
            iteratePropertyDefines((propertyDefine: PropertyDefine) => {
                menusRef.value.push({
                    label: propertyDefine.type,
                    data: propertyDefine,
                });
            });
        }

        async function createPropertyItem(propertyData?: { name: string, type: string }) {
            if (!propertyData) {
                console.debug('data undefined or define ', propertyData);
                return;
            }
            let define = getPropertyDefineByType(propertyData.type)
            let node = GraphNodeMgr.Instance.getNodeByID(selectId)
            let value = define.value
            if (node && node.properties && node.properties[propertyData.name]) {
                let tp = GraphPropertyMgr.Instance.getPropertyByID(node.properties[propertyData.name])
                value = tp.value
            }
            const valueDump = await MessageMgr.Instance.callSceneMethod('queryPropertyValueDumpByType', [
                propertyData.type, value
            ]);

            const propertyItem: PropertyItem = {
                valueDump: valueDump,
                ...propertyData,
            };

            propertyMap.set(propertyData.name, propertyItem);
            return propertyItem;
        }

        async function updateProperties() {
            loading.value = true;

            propertyMap.clear();

            let node = GraphNodeMgr.Instance.getNodeByID(selectId)

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


        function onDumpConfirm(event: { target: { dump: IProperty } }, variable: PropertyItem) {
            const dump = event.target && event.target.dump;
            if (dump) {
                variable.valueDump = dump;
                variable.value = dump.value;
                GraphPropertyMgr.Instance.updatePropertyValue(variable.id, {
                    id: variable.id,
                    name: variable.name,
                    type: variable.type,
                    value: variable.value,
                });
            }
        }

        function onRender(value: any) {
            return JSON.stringify(value);
        }

        return {
            loading,

            propertyRefs,
            menusRef,
            popupMenuRef,

            onRender,

            onDumpConfirm,
        };
    },

    template: `
    <div class="graph-inspector">
        <div class="title">
            <ui-label >inspector</ui-label>
        </div>
        <div class="property-contents">
            <div class="item" v-for="(property, index) in propertyRefs" :key="property.name + '' + index">
                <ui-prop class="prop">
                    <ui-label slot="label" class="label" :value="property.name"></ui-label>
                    <ui-input slot="label" class="label" :value="property.name"></ui-input>
                    <div slot="content" class="content">
                        <ui-prop no-label type="dump" :render="onRender(property.valueDump)"
                            @confirm-dump="onDumpConfirm($event, property)">
                        </ui-prop>
                    </div>
                </ui-prop>
            </div>
        </div>
        <div class="property-menu" v-if="popupMenuRef">
            <ui-label class="option" v-for="(menu, index) in menusRef" :key="menu.label + '' + index" :value="menu.label"
                @click.stop="addProperty(menu.data)"></ui-label>
        </div>
        <ui-loading class="loading" v-show="loading"></ui-loading>
    </div>
    `,
});


