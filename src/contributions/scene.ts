import type { PropertyDefine } from '../../@types/bt-node-type';


declare const cce: any;

exports.methods = {
    async queryVariableMap() {
        const { btTreeVariableMap } = await Editor.Module.importProjectModule('db://bt-graph/behavior-tree/Base/BTClass.ts') as { btTreeVariableMap: Map<string, any> };
        console.log(btTreeVariableMap)

        const variableMap: Map<string, PropertyDefine> = new Map();
        btTreeVariableMap.forEach((propertyDefine: PropertyDefine) => {
            const valueDump = cce.Dump.encode.encodeObject(propertyDefine.value, { default: propertyDefine.value });
            const newPropertyDefine: PropertyDefine = {
                name: propertyDefine.name,
                type: propertyDefine.type,
                value: valueDump.value,
            };
            variableMap.set(newPropertyDefine.type, newPropertyDefine);
        });
        return [...variableMap]
    },

    async queryNodeMap() {
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

    async queryNodeProperty(type) {
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

    async queryVariableType(type: string, value: any) {
        const { btTreeVariableMap } = await Editor.Module.importProjectModule('db://bt-graph/behavior-tree/Base/BTClass.ts') as { btTreeVariableMap: Map<string, any> };
        const propertyDefine: PropertyDefine = btTreeVariableMap.get(type)!;
        console.log(btTreeVariableMap)
        console.log(type)
        console.log(propertyDefine)
        const valueDump = cce.Dump.encode.encodeObject(propertyDefine.value, {});
        valueDump.value = value;
        return valueDump;
    },
};
