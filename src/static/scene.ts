import { IBTTreeClass } from "../runtime";

exports.methods = {
    async queryBTTreeClassMap() {
        const { btTreeClassMap } = await Editor.Module.importProjectModule('db://cclplugin/BehaviorTree/Base/BTClass.ts') as { btTreeClassMap: Map<string, IBTTreeClass> };
        return Array.from(btTreeClassMap.values())
    },
}