import { join } from 'path';
// @ts-ignore
import PACKAGE_JSON from '../../package.json';

const PROJECT_PATH = join(Editor.Project.path, 'assets');

const PACKAGE_NAME = PACKAGE_JSON.name;

const PANEL_NAME = `${PACKAGE_NAME}.bt-graph`;

const DEFAULT_NAME = 'New BT Graph';

const DEFAULT_ASSET_NAME = `${DEFAULT_NAME}.bggraph`;

const SUB_GRAPH_NODE_TYPE = 'SubGraphNode';

export {
    DEFAULT_ASSET_NAME, DEFAULT_NAME, PACKAGE_JSON, PACKAGE_NAME, PANEL_NAME, PROJECT_PATH, SUB_GRAPH_NODE_TYPE
};

