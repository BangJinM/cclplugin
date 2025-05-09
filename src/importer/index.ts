
export const methods = {
    async registerShaderGraphImporter380() {
        const { BTGraph380 } = await import('./bt-graph-3.8');
        return {
            extname: ['.btgraph'],
            importer: BTGraph380,
        };
    },

    async registerShaderGraphImporter() {
        return (await import('./bt-graph-handler')).default;
    },
};
