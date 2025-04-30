import { Color, Texture2D, TextureCube, ValueType, Vec2, Vec3, Vec4 } from 'cc';
import { PropertyValueType, SlotDefine } from './type';
import { getValueConcretePrecision, slot } from './utils';

export enum ShaderPropertyType {
    Float = 'Float',
    Boolean = 'Boolean',
    Vector2 = 'Vector2',
    Vector3 = 'Vector3',
    Vector4 = 'Vector4',
    Color = 'Color',
    Texture2D = 'Texture2D',
    // Texture2DArray = 'Texture2DArray',
    // Texture3D = 'Texture3D',
    TextureCube = 'TextureCube',
    // Gradient = 'Gradient',
    // Matrix2 = 'Matrix2',
    // Matrix3 = 'Matrix3',
    // Matrix4 = 'Matrix4',
}

export class ShaderProperty {
    details = {
        menu: '',
        // -> IBlockStyle,
        style: {
            headerColor: '#ec7063',
        },
        // feature: { } // -> IBlockFeature,
    };
    name = '';
    type: ShaderPropertyType = ShaderPropertyType.Float;
    value: PropertyValueType = 0;

    public constructor(type: ShaderPropertyType | string) {
        if (typeof type === 'string') {
            this.type = ShaderPropertyType[type as ShaderPropertyType];
        }
        else {
            this.type = type;
        }
        this.name = ShaderPropertyType[type as ShaderPropertyType];
        this.details.menu = this.name;
        this.updateDefaultValue();
    }

    setValue(value) {
        if (this.value instanceof ValueType) {
            this.value.set(value);
        }
        else if (this.type === ShaderPropertyType.Texture2D || this.type === ShaderPropertyType.TextureCube) {
            (this.value as Texture2D)._uuid = value.uuid;
        }
        else {
            this.value = value;
        }
    }

    updateDefaultValue() {
        switch (this.type) {
            case ShaderPropertyType.Float:
                this.value = 0;
                break;
            case ShaderPropertyType.Boolean:
                this.value = false;
                break;
            case ShaderPropertyType.Vector2:
                this.value = new Vec2;
                break;
            case ShaderPropertyType.Vector3:
                this.value = new Vec3;
                break;
            case ShaderPropertyType.Vector4:
                this.value = new Vec4;
                break;
            case ShaderPropertyType.Color:
                this.value = new Color;
                break;
            case ShaderPropertyType.Texture2D:
                this.value = new Texture2D;
                break;
            case ShaderPropertyType.TextureCube:
                this.value = new TextureCube;
                break;
        }
    }

    isTexture() {
        switch (this.type) {
            case ShaderPropertyType.Texture2D:
            case ShaderPropertyType.TextureCube:
                return true;
        }

        return false;
    }

    get concretePrecision() {
        return getValueConcretePrecision(this.value);
    }
}
