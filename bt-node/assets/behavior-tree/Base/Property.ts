import { Color, Texture2D, TextureCube, ValueType, Vec2, Vec3, Vec4 } from 'cc';
import { PropertyType } from './PropertyType';

export type PropertyValueType = Vec2 | Vec3 | Vec4 | number | boolean | Color | Texture2D | TextureCube;

/**
 * 收集 Property 类型
 */
export function CollectPropertyMap() {
    // 收集 property
    let propertyMap = new Map()
    for (const key in PropertyType) {
        const type = PropertyType[key as PropertyType];
        if (typeof type === 'string') {
            const shaderProperty = new Property(type);
            shaderProperty.type = type;
            propertyMap.set(type, {
                type: type,
                name: shaderProperty.name,
                value: shaderProperty.value,
            });
        }
    }
    return propertyMap;
}


export interface PropertyDefine {
    name: string;
    type: PropertyType;
    value: PropertyValueType;
}

export class Property implements PropertyDefine {
    name = '';
    type: PropertyType = PropertyType.Float;
    value: PropertyValueType = 0;

    public constructor(type: PropertyType | string) {
        if (typeof type === 'string') {
            this.type = PropertyType[type as PropertyType];
        }
        else {
            this.type = type;
        }
        this.name = PropertyType[type as PropertyType];
        this.updateDefaultValue();
    }

    setValue(value) {
        if (this.value instanceof ValueType) {
            this.value.set(value);
        }
        else if (this.type === PropertyType.Texture2D || this.type === PropertyType.TextureCube) {
            (this.value as Texture2D)._uuid = value.uuid;
        }
        else {
            this.value = value;
        }
    }

    updateDefaultValue() {
        switch (this.type) {
            case PropertyType.Float:
                this.value = 0;
                break;
            case PropertyType.Boolean:
                this.value = false;
                break;
            case PropertyType.Vector2:
                this.value = new Vec2;
                break;
            case PropertyType.Vector3:
                this.value = new Vec3;
                break;
            case PropertyType.Vector4:
                this.value = new Vec4;
                break;
            case PropertyType.Color:
                this.value = new Color;
                break;
            case PropertyType.Texture2D:
                this.value = new Texture2D;
                break;
            case PropertyType.TextureCube:
                this.value = new TextureCube;
                break;
        }
    }

    isTexture() {
        switch (this.type) {
            case PropertyType.Texture2D:
            case PropertyType.TextureCube:
                return true;
        }

        return false;
    }
}
