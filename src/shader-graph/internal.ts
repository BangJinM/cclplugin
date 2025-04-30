import type { NodeDefine, PropertyDefine } from '../../@types/shader-node-type';

/**
 * 存储 Shader Node 与 Shader Property
 */
export interface IModuleOptions {
    shaderNodeMap: Map<string, NodeDefine>;
    shaderPropertyMap: Map<string, PropertyDefine>;
    shaderNodeClassMap: Map<string, any>;// class
}
