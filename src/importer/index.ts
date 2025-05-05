import { ShaderGraph380 } from './shader-graph-3.8';

export const methods = {
    async registerShaderGraphImporter380() {
        const { ShaderGraph380 } = await import('./shader-graph-3.8');
        return {
            extname: ['.btgraph'],
            importer: ShaderGraph380,
        };
    },

    async registerShaderGraphImporter() {
        return (await import('./shader-graph-handler')).default;
    },
};
