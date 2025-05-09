/**
 * 该 type 是 bt node 那边类型定义，用于给 bt graph 使用
 */
import type { Color, Texture2D, TextureCube, Vec2, Vec3, Vec4 } from "cc";

export interface IRegisterOptions {
    menu?: string;
    title?: string;
    style?: { [key: string]: any }
    // 是否是主节点
    master?: boolean;
}

export type PropertyValueType = Vec2 | Vec3 | Vec4 | number | boolean | string | Color | Texture2D | TextureCube;

/**
 * Property Dump 数据
 */
export declare class PropertyDefine {
    name: string;
    type: string;
    value: PropertyValueType;
}
