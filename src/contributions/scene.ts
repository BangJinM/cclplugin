import type { PropertyDefine } from '../../@types/bt-node-type';

import shaderGraph from '../importer/bt-graph';

declare const cce: any;

exports.methods = {
    /**
     * 注册后需要让场景进程同步一下节点数据
     */
    afterDeclared() {
        shaderGraph.reset();
    },

    async queryProperty() {
        const { CollectPropertyMap } = await Editor.Module.importProjectModule('db://bt-graph/behavior-tree/Base/BTClass.ts') as { CollectPropertyMap: Function };
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
        return [...shaderPropertyList]
    },

    async queryBTNode() {
        const { btTreeClassMap } = await Editor.Module.importProjectModule('db://bt-graph/behavior-tree/Base/BTClass.ts') as { btTreeClassMap: Map<string, any> };
        console.log(btTreeClassMap)

        let property = []
        for (const [key, value] of btTreeClassMap) {
            property.push({
                type: value.type,
                name: value.name
            })
        }
        return property
    },

    async queryBTNodeProperty(type) {
        const { CollectNodeProperty } = await Editor.Module.importProjectModule('db://bt-graph/behavior-tree/Base/BTClass.ts') as { CollectNodeProperty: Function };
        const propertyList: Map<string, PropertyDefine> = new Map();
        CollectNodeProperty(type).forEach((propertyDefine: PropertyDefine) => {
            const valueDump = cce.Dump.encode.encodeObject(propertyDefine.value, { default: propertyDefine.value });
            const newPropertyDefine: PropertyDefine = {
                name: propertyDefine.name,
                type: propertyDefine.type,
                value: valueDump.value,
            };
            propertyList.set(newPropertyDefine.name, newPropertyDefine);
        });
        console.log(propertyList)
        return [...propertyList]
    },

    async queryPropertyValueDumpByType(type: string, value: any) {
        const { CollectPropertyMap } = await Editor.Module.importProjectModule('db://bt-graph/behavior-tree/Base/BTClass.ts') as { CollectPropertyMap: Function };
        let propertyMap = CollectPropertyMap();
        const propertyDefine: PropertyDefine = propertyMap.get(type)!;
        const valueDump = cce.Dump.encode.encodeObject(propertyDefine.value, {});
        valueDump.value = value;
        return valueDump;
    },
};
