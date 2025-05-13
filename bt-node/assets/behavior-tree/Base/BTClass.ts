import { BTType } from "./BTType";
import { Property } from "./Property";
import { PropertyType } from "./PropertyType";

export interface IBTTreeClass {
    name: string
    type: BTType
    create: Function
}

export const btTreeVariableMap: Map<string, { name: string, type: string, value: any }> = new Map();
export const btTreePropertyMap: Map<string, { name: string, type: string }[]> = new Map();
export const btTreeClassMap: Map<string, IBTTreeClass> = new Map();
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
        btTreeVariableMap.set(target.name, { name: temp.bName, type: temp.bType, value: temp.GetDefaultValue() })
        console.log(btTreeVariableMap)
    }
}

/**
 * 收集类中需要展示的变量
 * @param type 
 * @returns 
 */
export function bt_property(type: PropertyType) {
    return function (target, propertyKey) {
        if (!btTreePropertyMap.has(target.constructor.name)) {
            btTreePropertyMap.set(target.constructor.name, [])
        }

        btTreePropertyMap.get(target.constructor.name)?.push({
            name: propertyKey,
            type: type
        })

        console.log(btTreePropertyMap)
    };
};

/**
 * 收集 Property 类型
 */
export function CollectPropertyMap() {
    // 收集 property
    let propertyMap = new Map()
    for (const key in PropertyType) {
        const type = PropertyType[key as PropertyType];
        const shaderProperty = new Property(type);
        shaderProperty.type = type;
        propertyMap.set(type, {
            type: type,
            name: shaderProperty.name,
            value: shaderProperty.value,
        });
    }
    return propertyMap;
}

export function CollectNodeProperty(type: string) {
    let propertyMap = new Map()

    if (!btTreePropertyMap.has(type))
        return propertyMap

    for (const element of btTreePropertyMap.get(type)!) {
        const shaderProperty = new Property(element.type);
        propertyMap.set(element.type, {
            type: element.type,
            name: element.name,
            value: shaderProperty.value,
        });
    }

    console.log(propertyMap)
    return propertyMap
}