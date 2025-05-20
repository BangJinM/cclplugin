import { PropertyType } from "../Variable/PropertyType";
import { BTType } from "./BTType";

/** 类中的属性 */
export const btTreePropertyMap: Map<string, { name: string, type: string }[]> = new Map();
/** 可创建的变量 */
export const btTreeVariableMap: Map<string, { name: string, type: string, value: any, create: Function }> = new Map();
/** 节点 */
export const btTreeClassMap: Map<string, { name: string, type: BTType, create: Function }> = new Map();
/***
 * 收集被装饰的类，用来在运行时通过节点类型找到对应的class
 */
export function bt_class(type: BTType): ClassDecorator {
    return function (target) {
        btTreeClassMap.set(target.name, { type: type, name: target.name, create: target });
        console.log(target.name)
    };
};

/** 收集可以创建的变量 */
export function bt_variable(): ClassDecorator {
    return function (target) {
        let temp = Reflect.construct(target, [])
        btTreeVariableMap.set(temp.bType, { name: temp.bName, type: temp.bType, value: temp.GetDefaultValue(), create: target })
    }
}

/**
 * 收集类中需要展示的变量
 * @param type 
 * @returns 
 */
export function bt_property(type: PropertyType) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (!btTreePropertyMap.has(target.constructor.name)) {
            btTreePropertyMap.set(target.constructor.name, [])
        }

        btTreePropertyMap.get(target.constructor.name)?.push({
            name: propertyKey,
            type: type
        })
    };
}

export function CollectNodeProperty(type: string) {
    let propertyMap = new Map()

    if (!btTreePropertyMap.has(type))
        return propertyMap

    for (const element of btTreePropertyMap.get(type)!) {
        if (btTreeVariableMap.has(element.type)) {
            let variable = btTreeVariableMap.get(element.type)!
            propertyMap.set(element.type, {
                type: element.type,
                name: element.name,
                value: variable.value,
            });
        }
    }
    return propertyMap
}