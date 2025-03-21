'use strict';
import { ElMessage } from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

import { AssetInfo } from '@cocos/creator-types/editor/packages/asset-db/@types/public';
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import { GraphDataMgr } from '../../editor/BehaviorTree/GraphDataMgr';
import { graphAssetMgr } from '../../editor/GraphAssetMgr';

const weakMap = new WeakMap();
let graphDataMgr = GraphDataMgr.getInstance()

export default Editor.Panel.define({
    template: '<div id="app" ></div>', // 只留一个 div 用于 vue 的挂载
    $: {
        root: '#app',
    },
    ready() {
        if (!this.$.root) return;

        const app = createApp(App);
        app.provide('graphDataMgr', graphDataMgr);
        app.provide('appRoot', this.$.root);
        app.provide('message', (options) => {
            if (typeof options === 'string') {
                options = { message: options };
            }
            options.appendTo = options.appendTo || this.$.root;
            return ElMessage(options);
        });
        app.mount(this.$.root);
        weakMap.set(this, app);
        graphDataMgr.InitMsg()
    },
    close() {
        const app = weakMap.get(this);
        app?.unmount?.();
    },
    methods: {
        async openAssetUUID(uuid) {
            let assetInfo: AssetInfo = await Editor.Message.request('asset-db', 'query-asset-info', uuid);
            let data = await graphAssetMgr.readFileByUUUID(uuid);
            graphDataMgr.initPanel(assetInfo, data)
        },
    },
});
