import { basename, extname, relative } from 'path';

import { PROJECT_PATH } from './global-exports';

export function generateUUID() {
    return 'p_' + Date.now() + (Math.random() + '').substring(10);
}

/**
 * 是否坐标包含在里面
 * @param point
 * @param bounds
 */
export function contains(point: { x: number, y: number }, bounds: { x: number, y: number, width: number, height: number }): boolean {
    return point.x >= bounds.x && point.x <= bounds.x + bounds.width && point.y >= bounds.y && point.y <= bounds.y + bounds.height;
}


/**
 * 转成在项目 assets 目录下
 * @param path
 */
export function convertToProjectDbUrl(path?: string | undefined): string {
    if (!path) return '';

    return `db://assets/${relative(PROJECT_PATH, path)}`;
}

export async function getAssetUuidByPath(path?: string | undefined): Promise<string> {
    if (!path) return '';

    const url = convertToProjectDbUrl(path);
    const uuid = await Editor.Message.request('asset-db', 'query-uuid', url);
    if (!uuid) {
        console.error(`loadByUrl failed, can't get uuid by ${url}`);
        return '';
    }
    return uuid;
}

export function getName(path: string): string {
    return basename(path, extname(path));
}
