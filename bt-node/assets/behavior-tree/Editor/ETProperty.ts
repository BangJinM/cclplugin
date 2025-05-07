import { Vec2, Vec3, Vec4 } from "cc";

export interface IRegisterOptions {
    menu?: string;
    title?: string;
}

/** 用于插件的属性展示 */
export class ETProperty<T> {
    details: IRegisterOptions = {
        menu: '',
    };
    name = '';
    type: string = "";
    value: T = null;

    public constructor(type: string, value: T) {
        this.name = type;
        this.type = type
        this.details.menu = this.name;
        this.value = value
    }
}


/**
 * 收集 ETProperty 类型
 * @param declareType - 实际需要创建的 Block 类型
 */
export const CollectETProperty = () => {
    let propertyMap = new Map()

    propertyMap.set("Float", new ETProperty<Number>("Float", 0))
    propertyMap.set("Vector2", new ETProperty<Vec2>("Vector2", new Vec2()))
    propertyMap.set("Vector3", new ETProperty<Vec3>("Vector3", new Vec3()))
    propertyMap.set("Vector4", new ETProperty<Vec4>("Vector4", new Vec4()))

    console.log("dddddddddddddddddd")

    return propertyMap
}

