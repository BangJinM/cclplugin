import type { PropertyDefine, SlotDefine } from '../../@types/bt-node-type';

import shaderGraph from '../importer/bt-graph';

declare const cce: any;

function createSlot(slot: SlotDefine) {
    const valueDump = cce.Dump.encode.encodeObject(slot.default, { default: slot.default });
    return {
        default: valueDump.value,
        type: slot.type,
        connectType: slot.connectType,
        display: slot.display,
        enum: slot.enum,
        registerEnumType: slot.registerEnumType,
        registerEnum: slot.registerEnum,
    };
}

exports.methods = {
    /**
     * 注册后需要让场景进程同步一下节点数据
     */
    afterDeclared() {
        shaderGraph.reset();
    },

    async queryShaderNode() {
        const { CollectPropertyMap } = await Editor.Module.importProjectModule('db://bt-graph/behavior-tree/Base/Property.ts') as { CollectPropertyMap: Function };
        const shaderPropertyList: Map<string, PropertyDefine> = new Map();
        CollectPropertyMap().forEach((propertyDefine: PropertyDefine) => {
            const valueDump = cce.Dump.encode.encodeObject(propertyDefine.value, { default: propertyDefine.value });
            const newPropertyDefine: PropertyDefine = {
                name: propertyDefine.name,
                type: propertyDefine.type,
                value: valueDump.value,
            };
            shaderPropertyList.set(newPropertyDefine.type, newPropertyDefine);
        });

        const { btTreeClassMap } = await Editor.Module.importProjectModule('db://bt-graph/behavior-tree/Base/BTClass.ts') as { btTreeClassMap: Map<string, any> };
        console.log(btTreeClassMap)

        let property = []
        for (const [key, value] of btTreeClassMap) {
            property.push({
                type: value.type,
                name: value.name
            })
        }

        return {
            shaderPropertyList: [...shaderPropertyList],
            btTreeClassMap: property
        };
    },

    async queryPropertyValueDumpByType(type: string, value: any) {
        const { CollectPropertyMap } = await Editor.Module.importProjectModule('db://bt-graph/behavior-tree/Base/Property.ts') as { CollectPropertyMap: Function };
        let propertyMap = CollectPropertyMap();
        const propertyDefine: PropertyDefine = propertyMap.get(type)!;
        const valueDump = cce.Dump.encode.encodeObject(propertyDefine.value, {});
        valueDump.value = value;
        return valueDump;
    },
};
