import { readFileSync } from 'fs-extra';
import { join, relative } from 'path';

import type { AssetInfo } from '@cocos/creator-types/editor/packages/asset-db/@types/public';
import { writeFileSync } from 'fs';

/**
 * 用于处理 shader-graph Asset 资源的存储
 */
export class GraphAssetMgr {
    async readFileByUUUID(uuid) {
        let assetInfo: AssetInfo = await Editor.Message.request('asset-db', 'query-asset-info', uuid);
        if (!assetInfo) return "";
        let assetData = readFileSync(assetInfo.file, 'utf8');
        if (assetData.length > 0) return assetData
        return ""
    }

    async writeFileByUUUID(uuid, content) {
        let assetInfo: AssetInfo = await Editor.Message.request('asset-db', 'query-asset-info', uuid);
        if (!assetInfo) return false;
        return await writeFileSync(assetInfo.file, content);
    }

    convertToProjectDbUrl(path?: string | undefined): string {
        if (!path) return '';

        return `db://assets/${relative(join(Editor.Project.path, 'assets'), path)}`;
    }

    async getAssetUuidByPath(path?: string | undefined): Promise<string> {
        if (!path) return '';

        const url = this.convertToProjectDbUrl(path);
        const uuid = await Editor.Message.request('asset-db', 'query-uuid', url);
        if (!uuid) {
            console.error(`loadByUrl failed, can't get uuid by ${url}`);
            return '';
        }
        return uuid;
    }

    /**
     * 打开指定资源
     */
    public async open(name: string, extensions: string[], callback: Function): Promise<boolean> {
        try {
            const result = await Editor.Dialog.select({
                title: Editor.I18n.t('选择资源'),
                path: join(Editor.Project.path, 'assets'),
                type: 'file',
                multi: false,
                filters: [{ name: name, extensions: extensions }],
            });

            if (!result || !result.filePaths || !result.filePaths[0]) return

            const uuid = await this.getAssetUuidByPath(result.filePaths[0]);
            let assetInfo: AssetInfo = await Editor.Message.request('asset-db', 'query-asset-info', uuid);
            let data = await this.readFileByUUUID(uuid);
            callback(assetInfo, data)
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    /**
     * 新建资源
     */
    public async createNew(name: string, extensions: string[], defaultDataFunc: Function, callback: Function): Promise<boolean> {
        try {
            const result = await Editor.Dialog.save({
                title: Editor.I18n.t('shader-graph.messages.save.title'),
                path: join(Editor.Project.path, 'assets', name),
                filters: [{
                    name: name,
                    extensions: extensions,
                }],
            });
            if (!result?.filePath) return
            const url = this.convertToProjectDbUrl(result.filePath);
            const defaultStr = defaultDataFunc()
            console.log("createNew")
            console.log(defaultStr)
            const asset = await this.createAsset(url, defaultStr);
            await this.writeFileByUUUID(asset?.uuid, defaultStr);
            let data = await this.readFileByUUUID(asset?.uuid);
            callback(asset, data)
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    /**
     * 保存
     */
    public async save(assetInfo, assetData): Promise<boolean> {
        try {
            if (!assetInfo) return false;
            console.time('save');
            Editor.Message.request('asset-db', 'save-asset', assetInfo.uuid, assetData).then(() => {
                console.timeEnd('save');
            });
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    /**
     * 另存为
     */
    public async saveAs(assetInfo: AssetInfo, defaultName: string, extensions: string[], content: string, callback: Function): Promise<boolean> {
        try {
            const result = await Editor.Dialog.save({
                title: Editor.I18n.t('shader-graph.messages.save.title'),
                path: join(Editor.Project.path, 'assets', assetInfo?.name || defaultName),
                filters: [{
                    name: defaultName,
                    extensions: extensions,
                }],
            });

            const url = this.convertToProjectDbUrl(result.filePath);
            if (!url) {
                console.debug('另存资源失败, 保存的 url 为 null');
                return false;
            }

            const asset = await this.createAsset(url, content);
            if (asset) {
                let data = await this.readFileByUUUID(asset.uuid);
                callback(asset, data)
            }
            return false;
        } catch (e) {
            console.error('保存失败!', e);
            return false;
        }
    }

    // /**
    //  * 检查是否需要保存
    //  */
    // public async checkIfSave(): Promise<boolean> {
    //     if (this.assetInfo && !existsSync(this.assetInfo.file)) {
    //         const result = await Editor.Dialog.warn(Editor.I18n.t('shader-graph.messages.missing_assets.detail'), {
    //             title: Editor.I18n.t('shader-graph.messages.titles.normal'),
    //             default: 0,
    //             cancel: 1,
    //             buttons: [
    //                 Editor.I18n.t('shader-graph.buttons.save'),
    //                 Editor.I18n.t('shader-graph.buttons.unsaved'),
    //             ],
    //         });
    //         if (0 === result.response) {
    //             // 另存为
    //             return await this.saveAs();
    //         }
    //         return false;
    //     } else {
    //         const result = await Editor.Dialog.warn(Editor.I18n.t('shader-graph.messages.save.detail'), {
    //             title: Editor.I18n.t('shader-graph.messages.titles.normal'),
    //             default: 0,
    //             cancel: 1,
    //             buttons: [
    //                 Editor.I18n.t('shader-graph.buttons.save'),
    //                 Editor.I18n.t('shader-graph.buttons.unsaved'),
    //             ],
    //         });
    //         if (0 === result.response) {
    //             // 另存为
    //             return await this.save();
    //         }
    //         return false;
    //     }
    // }

    protected async createAsset(url: string | undefined, content: string | undefined): Promise<AssetInfo | undefined> {
        try {
            if (!url || !content) return;
            // 强制覆盖
            console.log("dddddddddddddd" + content)
            return await Editor.Message.request('asset-db', 'create-asset', url, content, { overwrite: true }) as AssetInfo;
        } catch (e) {
            console.error(e);
        }
    }

    // public assetAdd(uuid: string, info: AssetInfo) {
    //     // if (info && info.importer) {
    //     //     MessageMgr.Instance.callSceneMethod('registerEffects', [uuid]);
    //     // }
    // }

    // public async assetDelete(uuid: string, info: AssetInfo) {
    //     // if (info && info.importer) {
    //     //     MessageMgr.Instance.callSceneMethod('removeEffects', [uuid]);
    //     // }
    //     // if (this.uuid === uuid) {
    //     //     await GraphConfigMgr.Instance.delete(uuid);
    //     //     MaskMgr.Instance.show(MaskType.AssetMissing);
    //     // }
    // }

    // public assetChange(uuid: string, info: AssetInfo) {

    //     // if (info && info.importer) {
    //     //     MessageMgr.Instance.callSceneMethod('updateEffect', [uuid]);
    //     // }

    //     // if (this.uuid === uuid && GraphDataMgr.Instance.graphForge && GraphDataMgr.Instance.graphData) {
    //     //     try {
    //     //         // 更新名字
    //     //         const newName = getName(info.name);
    //     //         const needToRename = GraphDataMgr.Instance.graphForge.getCurrentGraph().name !== newName;

    //     //         const dirty = GraphDataMgr.Instance.getDirty();
    //     //         if (dirty && needToRename) {
    //     //             MaskMgr.Instance.show(MaskType.NeedSaveBeReloadByRename);
    //     //             return;
    //     //         }

    //     //         if (dirty) return;

    //     //         if (needToRename) {
    //     //             this.load();
    //     //             return;
    //     //         }

    //     //         // const baseData = readFileSync(info.file, 'utf8');
    //     //         // const conflictA = this.graphForge.serialize() !== baseData;
    //     //         // const conflictB = this.graphForge.serialize(this.graphData) !== baseData;
    //     //         //
    //     //         // if (conflictA && conflictB) {
    //     //         //     MaskMgr.Instance.show(MaskType.AssetChange);
    //     //         // }
    //     //     } catch (e) {
    //     //         console.error(e);
    //     //     }
    //     // }
    // }
}


export const graphAssetMgr = new GraphAssetMgr()