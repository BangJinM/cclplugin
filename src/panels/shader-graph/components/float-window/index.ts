import type { FloatWindowConfig } from './internal';

import FloatWindow from './base';
import * as CreateNode from './create-node';
import * as GraphProperty from './graph-property';

export * from './internal';

const floatWindowMap = new Map<string, any/*DefineComponent*/>([
    [
        GraphProperty.DefaultConfig.key,
        GraphProperty.component,
    ],
    [
        CreateNode.DefaultConfig.key,
        CreateNode.component,
    ]
]);

export const floatWindowConfigs: Map<string, FloatWindowConfig> = new Map();

export function getFloatWindowConfigByName(name: string): FloatWindowConfig | undefined {
    return floatWindowConfigs.get(name);
}

export async function updateFloatWindowConfigs() {
    const configs = [
        GraphProperty.getConfig(),
        CreateNode.getConfig(),
    ];
    configs.forEach(config => {
        floatWindowConfigs.set(config.key, config);
    });
    return configs;
}

function getFloatWindowMap() {
    return floatWindowMap;
}

export {
    FloatWindow,
    getFloatWindowMap
};

