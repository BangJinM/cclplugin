import { debounce, merge } from 'lodash';

import type { IProperty } from '@cocos/creator-types/editor/packages/scene/@types/public';
import type { PropertyDefine } from '../../../../../@types/bt-node-type';

import {
    GraphConfigMgr,
    GraphPropertyMgr,
    MessageMgr,
    MessageType,
    projectData,
    PropertyData
} from '../../../../bt-graph';
import BaseFloatWindow from './baseFloatWindow';
import { commonEmits, commonLogic, commonTemplate } from './common';
import { FloatWindowConfig, FloatWindowDragTarget } from './internal';

import { defineComponent, ref } from 'vue/dist/vue.js';

type PropertyItem = {
    menu: string;
    rename: boolean;
    showDelete: boolean;
    valueDump: IProperty | undefined;
    components?: string[];
    methods?: string[];
    value: any;
} & PropertyData;

export const DefaultConfig: FloatWindowConfig = {
    key: 'graph-property',
    tab: {
        name: 'i18n:bt-graph.graph_property.menu_name',
        show: true,
        height: 80,
    },
    base: {
        title: 'i18n:bt-graph.graph_property.title',
        width: '530px',
        height: '300px',
        minWidth: '530px',
        minHeight: '300px',
        defaultShow: false,
    },
    position: {
        top: '28px',
        left: '28px',
    },
    events: {
        resizer: true,
        drag: true,
        target: FloatWindowDragTarget.header,
    },
};

export function getConfig() {
    const newConfig = JSON.parse(JSON.stringify(DefaultConfig));
    const config = GraphConfigMgr.Instance.getFloatingWindowConfigByName(DefaultConfig.key);
    if (config) {
        newConfig.details = merge({}, newConfig.details, config);
    }
    return newConfig;
}

export const component = defineComponent({
    components: {
        BaseFloatWindow,
    },

    directives: {
        focus: (el) => {
            // 不延迟的话，无法 focus，可能是时机问题
            setTimeout(() => {
                el.focus();
            });
        },
    },

    props: {
        config: {
            type: Object as () => FloatWindowConfig,
            required: true,
            default: null,
        },
    },

    emits: [...commonEmits],

    setup(props, ctx) {
        const common = commonLogic(props, ctx);
        const deleteStyleRef = ref();
        const loading = ref(false);
        const popupMenuRef = ref(false);
        const menusRef = ref<{ label: string; data: PropertyDefine }[]>([]);
        const propertyRefs = ref<PropertyItem[]>([]);

        const propertyMap: Map<string, PropertyItem> = new Map();

        function updateMenuByShaderPropertyDefines() {
            menusRef.value = [];
            projectData.iteratePropertyDefines((propertyDefine: PropertyDefine) => {
                menusRef.value.push({
                    label: propertyDefine.name,
                    data: propertyDefine,
                });
            });
        }

        async function updateProperties() {
            loading.value = true;
            updateMenuByShaderPropertyDefines();

            propertyMap.clear();
            await GraphPropertyMgr.Instance.iterateProperties(async (property: PropertyData, propertyDefine: PropertyDefine | undefined) => {
                await createPropertyItem(property, propertyDefine);
            });

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
            if (!common.isShow()) return;
            updatePropertiesDebounce();
        });

        async function createPropertyItem(propertyData?: PropertyData, propertyDefine?: PropertyDefine) {
            if (!propertyData || !propertyDefine) {
                console.debug('data undefined or define ', propertyData, propertyDefine);
                return;
            }

            const menu = `Variables/${propertyData.name}`;


            const valueDump = await MessageMgr.Instance.callSceneMethod('queryVariableType', [
                propertyData.type, propertyData.value ?? propertyDefine.value,
            ]);




            const propertyItem: PropertyItem = {
                menu: menu,
                rename: false,
                showDelete: false,
                valueDump: valueDump,
                ...propertyData,
            };

            setCompMethods(propertyItem)

            propertyMap.set(propertyData.id, propertyItem);
            return propertyItem;
        }

        async function addProperty(propertyDefine: PropertyDefine) {
            const variableData = GraphPropertyMgr.Instance.addProperty(propertyDefine);
            const item: PropertyItem | undefined = await createPropertyItem(variableData, propertyDefine);
            if (item) {
                item.rename = true;
                propertyRefs.value.push(item);
            }
            popupMenuRef.value = false;
            document.removeEventListener('mouseup', onFullscreenMouseUp);
        }

        function onDelete(index: number) {
            GraphPropertyMgr.Instance.removeProperty(index);
            propertyRefs.value.splice(index, 1);
        }

        // 用于隐藏 menu
        function onFullscreenMouseUp() {
            if (popupMenuRef.value) {
                setTimeout(() => {
                    popupMenuRef.value = false;
                    document.removeEventListener('mouseup', onFullscreenMouseUp);
                }, 10);
            }
        }

        function onPopupMenu() {
            popupMenuRef.value = true;
            document.addEventListener('mouseup', onFullscreenMouseUp);
        }

        function goToRename(event: MouseEvent, variable: PropertyItem) {
            variable.rename = true;
        }

        function onRender(value: any) {
            return JSON.stringify(value);
        }

        function onRenameSubmit(name: string, variableItem: PropertyItem) {
            variableItem.rename = false;
            variableItem.showDelete = false;
            if (name === variableItem.name || !name) return;

            if (GraphPropertyMgr.Instance.exitsProperty(name)) {
                console.warn('rename failed, a great name');
                return;
            }

            variableItem.menu = `Variables/${name}`;
            variableItem.name = name;
            const variableData: PropertyData | undefined = GraphPropertyMgr.Instance.getPropertyByID(variableItem.id);
            if (variableData) {
                variableData.name = name;
                GraphPropertyMgr.Instance.updateProperty(variableItem.id, variableData);
            } else {
                console.error('rename failed, variable data not found by ID: ' + variableItem.id);
            }
            variableItem.rename = false;
        }

        function onRenameCancel(variable: PropertyItem) {
            variable.rename = false;
        }

        function onMouseEnter(variable: PropertyItem) {
            if (variable.rename) return;

            variable.showDelete = true;
        }

        function onMouseLeave(variable: PropertyItem) {
            if (variable.rename) return;

            variable.showDelete = false;
        }

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

        async function onConfirm(value, variable: PropertyItem, index = 0) {
            if (variable.type == "Node" || variable.type == "Component") {
                if (!variable.value)
                    variable.value = {}
                variable.value.uuid = value
            } else if (variable.type == "Function") {
                if (!variable.value)
                    variable.value = {}
                if (index == 0) {
                    variable.value.uuid = value
                    variable.value.component = ""
                    variable.value.methodName = ""
                }
                else if (index == 1) {
                    variable.value.component = value
                    variable.value.methodName = ""
                }
                else variable.value.methodName = value

                setCompMethods(variable)
            }
            GraphPropertyMgr.Instance.updatePropertyValue(variable.id, {
                id: variable.id,
                name: variable.name,
                type: variable.type,
                value: variable.value,
            });
        }

        async function setCompMethods(propertyData: PropertyItem) {
            if (propertyData.type != "Function") return

            if (!propertyData.value || !propertyData.value.uuid)
                return

            const [nodeInfo, compMethodInfo] = await Promise.all([
                Editor.Message.request("scene", "query-node", propertyData.value.uuid),
                Editor.Message.request("scene", "query-component-function-of-node", propertyData.value.uuid),
            ]);

            if (!nodeInfo) return

            propertyData.components = []
            propertyData.methods = []

            for (const element in compMethodInfo) {
                propertyData.components.push(element)
            }

            if (propertyData.value.component) {
                let methods = compMethodInfo[propertyData.value.component] || []
                for (const key of methods) {
                    propertyData.methods.push(key)
                }
            }


            console.log(nodeInfo)
            console.log(compMethodInfo)
        }

        function show() {
            common.show();
            updatePropertiesDebounce();
        }

        return {
            ...common,

            loading,

            propertyRefs,
            menusRef,
            popupMenuRef,
            deleteStyleRef,

            addProperty,
            onPopupMenu,
            onRender,
            onDelete,

            onDumpConfirm,
            onConfirm,

            goToRename,
            onRenameSubmit,
            onRenameCancel,
            onMouseEnter,
            onMouseLeave,

            show,
        };
    },

    template: commonTemplate({
        css: 'graph-property',
        section: `

        <div class="property-title">
            <ui-label class="name" value="i18n:bt-graph.graph_property.add">
            </ui-label>
            <ui-icon class="add" value="add-more" @click.stop="onPopupMenu()" tooltip="i18n:bt-graph.graph_property.add">
            </ui-icon>
        </div>

        <div class="property-contents">
            <div class="item" v-for="(property, index) in propertyRefs" :key="property.name + '' + index"
                @mouseenter="onMouseEnter(property)" @mouseleave="onMouseLeave(property)">
                <ui-prop class="prop">
                    <ui-input slot="label" class="input" v-if="property.rename" :value="property.name"
                        @blur="onRenameSubmit($event.target.value, property)" @keydown.stop
                        @keydown.enter="$event.target.blur()" @keydown.esc="onRenameCancel(property)" @click.stop @dblclick.stop
                        @change.stop v-focus></ui-input>
                    <ui-drag-item slot="label" class="label" type="property" v-else
                        @dblclick.stop="goToRename($event, property, index)">
                        <ui-icon class="key" value="key"></ui-icon>
                        <ui-label class="name" :value="property.name" :tooltip="property.name"></ui-label>
                    </ui-drag-item>
                    <div slot="content" class="content">
                        <ui-node v-if="property.type == 'Node'" droppable="cc.Node" :value="property.value?.uuid" @confirm="onConfirm($event.target.value, property)"></ui-node>
                        <ui-component v-else-if="property.type == 'Component'" :value="property.value?.uuid" @confirm="onConfirm($event.target.value, property)"></ui-component>
                        <div v-else-if="property.type == 'Function'">
                            <ui-node :value="property.value?.uuid" @confirm="onConfirm($event.target.value, property, 0)"></ui-node>
                            <ui-select :value="property.value?.component" @confirm="onConfirm($event.target.value, property,1)">
                                <option v-for="comp of property.components" :value="comp" :key="comp">
                                    {{ comp }}
                                </option>
                            </ui-select>
                            <ui-select :value="property.value?.methodName" @confirm="onConfirm($event.target.value, property, 2)">
                               <option v-for="method of property.methods" :value="method" :key="method">
                                    {{ method }}
                                </option>
                            </ui-select>
                        </div>
                        <ui-prop v-else no-label type="dump" :render="onRender(property.valueDump)" @confirm-dump="onDumpConfirm($event, property)"> </ui-prop>
                    </div>
                </ui-prop>
                <div class="delete">
                    <ui-icon class="icon" v-if="property.showDelete" :tooltip="'i18n:bt-graph.graph_property.delete'"
                        value="close" @click="onDelete(index)"></ui-icon>
                </div>
            </div>
        </div>

        <div class="property-menu" v-if="popupMenuRef">
            <ui-label class="option" v-for="(menu, index) in menusRef" :key="menu.label + '' + index" :value="menu.label"
                @click.stop="addProperty(menu.data)"></ui-label>
        </div>
        `,
        footer: `
            <ui-loading class="loading" v-show="loading"></ui-loading>
        `,
    }),
});
