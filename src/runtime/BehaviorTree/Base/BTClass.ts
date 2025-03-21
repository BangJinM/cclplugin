import { BTType } from "./BTType";

export interface IBTTreeClass {
    name: string
    type: BTType
    func: Function
}

export const btTreeClassMap: Map<string, IBTTreeClass> = new Map();
/***
 * 收集被装饰的类，用来在运行时通过节点类型找到对应的class
 */
export const bt_class = (type: BTType): ClassDecorator => {
    return function (target) {
        btTreeClassMap.set(target.name, { type: type, name: target.name, func: target });
    };
};

