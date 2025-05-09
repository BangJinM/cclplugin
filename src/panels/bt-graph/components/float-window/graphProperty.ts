import { debounce, merge } from 'lodash';

import type { IProperty } from '@cocos/creator-types/editor/packages/scene/@types/public';
import type { PropertyDefine } from '../../../../../@types/bt-node-type';

import {
    GraphConfigMgr,
    GraphEditorAddOptions,
    GraphPropertyMgr,
    iteratePropertyDefines,
    MessageMgr,
    MessageType,
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
    addOptions?: GraphEditorAddOptions;
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
        width: '300px',
        height: '240px',
        minWidth: '300px',
        minHeight: '240px',
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
            iteratePropertyDefines((propertyDefine: PropertyDefine) => {
                menusRef.value.push({
                    label: propertyDefine.type,
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

            const valueDump = await MessageMgr.Instance.callSceneMethod('queryPropertyValueDumpByType', [
                propertyData.type, propertyData.value ?? propertyDefine.value,
            ]);

            const propertyItem: PropertyItem = {
                menu: menu,
                rename: false,
                showDelete: false,
                valueDump: valueDump,
                ...propertyData,
            };

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
    <ui-label class="name" 
        value="i18n:bt-graph.graph_property.add">
    </ui-label>
    <ui-icon class="add"  
        value="add-more"
        @click.stop="onPopupMenu()"
        tooltip="i18n:bt-graph.graph_property.add">
    </ui-icon>
</div>

<div class="property-contents">
    <div
        class="item"
        v-for="(property, index) in propertyRefs" 
        :key="property.name + '' + index"
        @mouseenter="onMouseEnter(property)"
        @mouseleave="onMouseLeave(property)"
    >
        <ui-prop class="prop">   
            <ui-input slot="label" class="input"
                v-if="property.rename"
                :value="property.name"
                @blur="onRenameSubmit($event.target.value, property)"
                @keydown.stop
                @keydown.enter="$event.target.blur()"
                @keydown.esc="onRenameCancel(property)"
                @click.stop
                @dblclick.stop
                @change.stop
                v-focus
            ></ui-input>
            <ui-drag-item slot="label" class="label" type="property"   v-else  @dblclick.stop="goToRename($event, property, index)" >
                <ui-icon class="key" value="key"></ui-icon>
                <ui-label
                    class="name"
                    :value="property.name"
                    :tooltip="property.name"
                ></ui-label>
            </ui-drag-item>
            <div slot="content" class="content">
                <ui-prop no-label
                    type="dump"
                    :render="onRender(property.valueDump)"
                    @confirm-dump="onDumpConfirm($event, property)"
                >
                </ui-prop>
            </div>
        </ui-prop>
        <div class="delete">
            <ui-icon class="icon" v-if="property.showDelete"
                :tooltip="'i18n:bt-graph.graph_property.delete'"
                value="close" 
                @click="onDelete(index)"
            ></ui-icon>
        </div>
    </div>
</div>

<div class="property-menu"
    v-if="popupMenuRef"
>
    <ui-label class="option" 
        v-for="(menu, index) in menusRef" 
        :key="menu.label + '' + index"
        :value="menu.label"
        @click.stop="addProperty(menu.data)"
    ></ui-label>
</div>
        `,
        footer: `
            <ui-loading class="loading" v-show="loading"></ui-loading>
        `,
    }),
});
