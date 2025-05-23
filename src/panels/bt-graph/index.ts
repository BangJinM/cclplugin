'use state';
import { readFileSync } from 'fs-extra';
import { join } from 'path';
import Vue from 'vue/dist/vue.js';

import ShaderGraph from './ViewComponent';

import { AssetInfo } from '@cocos/creator-types/editor/packages/asset-db/@types/public';
import {
    GraphAssetMgr,
    GraphConfigMgr,
    GraphDataMgr,
    MaskMgr,
    MaskType,
    MessageMgr,
    PANEL_NAME,
    projectData
} from '../../bt-graph';
import * as Shortcuts from './shortcuts';

let vm: any = null;

const options = {
    listeners: {},
    style: readFileSync(join(__dirname, '../../../static/bt-graph/style.css'), 'utf-8'),
    template: readFileSync(join(__dirname, '../../../static/bt-graph/index.html'), 'utf-8'),
    $: {
        forge: '#graph-forge',
        shaderGraph: '#bt-graph',
    },
    methods: {
        async openAsset(assetUuid: string, lastAssetUuid: string) {
            if (!vm) return;
            Editor.Panel.focus(PANEL_NAME);

            await GraphConfigMgr.Instance.autoSave(lastAssetUuid);
            await GraphAssetMgr.Instance.openAsset();
        },
        async onSceneReady() {
            if (!vm) return;

            if (GraphDataMgr.Instance.getDirty()) {
                await GraphAssetMgr.Instance.checkIfSave();
            }

            MessageMgr.Instance.setSceneReady(true);
            await projectData.declareGraphBlock();
            await GraphAssetMgr.Instance.load();
            MaskMgr.Instance.hide(MaskType.WaitLoad);
            MaskMgr.Instance.hide(MaskType.WaitSceneReady);
        },
        async onSceneClose() {
            if (!vm) return;

            MessageMgr.Instance.setSceneReady(false);
            MaskMgr.Instance.show(MaskType.WaitSceneReady);
        },

        onAssetAdd(uuid: string, info: AssetInfo) {
            if (!vm || info.importer !== 'bt-graph') return;
        },
        onAssetDelete(uuid: string, info: AssetInfo) {
            if (!vm || info.importer !== 'bt-graph') return;

            GraphAssetMgr.Instance.assetDelete(uuid, info);
        },
        onAssetChange(uuid: string, info: AssetInfo) {
            if (!vm || info.importer !== 'bt-graph') return;

            GraphAssetMgr.Instance.assetChange(uuid, info);
        },
        ...Shortcuts,
    },
    async ready() {
        vm?.$destroy();
        vm = new Vue({
            extends: ShaderGraph,
        });

        // 创建 shader graph View
        vm.$mount(this.$.shaderGraph);
    },
    async beforeClose() {
        await GraphConfigMgr.Instance.autoSave();
        if (GraphDataMgr.Instance.getDirty()) {
            await GraphAssetMgr.Instance.checkIfSave();
        }
    },
    close() {
        MessageMgr.Instance.unregisterAll();
        vm?.$destroy();
        vm = null;
    },
};

// @ts-ignore
module.exports = Editor.Panel.define(options);
