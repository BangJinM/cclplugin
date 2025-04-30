import type { PropertyDefine } from '../../../@types/shader-node-type';

import { getPropertyDefineByType } from '../declare';
import { GraphDataMgr, PropertyData } from './index';

/**
 * 用于处理 Property
 */
export class GraphPropertyMgr {

    static _instance: GraphPropertyMgr | null = null;

    public static get Instance(): GraphPropertyMgr {
        if (!this._instance) {
            this._instance = new GraphPropertyMgr();
        }
        return this._instance;
    }

    public getPropertyByID(id: string) {
        const currentGraphData = GraphDataMgr.Instance.getCurrentGraphData();

        return currentGraphData.details.properties.find((property: PropertyData) => property.id === id);
    }

    public updateProperty(id: string, newPropertyData: PropertyData) {
        const currentGraphData = GraphDataMgr.Instance.getCurrentGraphData();

        currentGraphData.details.properties = currentGraphData.details.properties.map((item: PropertyData) => {
            if (item.id === id) {
                return newPropertyData;
            }
            return item;
        });
        this.updatePropertyToGraphNode(newPropertyData);
        GraphDataMgr.Instance.setDirty(true);
    }

    public updatePropertyValue(id: string, value: PropertyData) {
        const currentGraphData = GraphDataMgr.Instance.getCurrentGraphData();
        if (!currentGraphData) return;

        currentGraphData.details.properties = currentGraphData.details.properties.map((item: PropertyData) => {
            if (item.id === id) {
                item = value;
            }
            return item;
        });
        this.updatePropertyToGraphNode(value);
        GraphDataMgr.Instance.setDirty(true);
    }

    public async iterateProperties(handle: (property: PropertyData, propertyDefine: PropertyDefine | undefined) => void) {
        const currentGraphData = GraphDataMgr.Instance.getCurrentGraphData();
        if (!currentGraphData) return;

        for (const property of currentGraphData.details.properties) {
            await handle(property, getPropertyDefineByType(property.type));
        }
    }

    public exitsProperty(name: string) {
        const currentGraphData = GraphDataMgr.Instance.getCurrentGraphData();

        for (const property of currentGraphData.details.properties) {
            if (property.name === name) {
                return true;
            }
        }
        return false;
    }

    public createProperty(type: string | PropertyDefine, name: string) {
        let propertyDefine: PropertyDefine;
        if (typeof type === 'string') {
            propertyDefine = getPropertyDefineByType(type);
        } else {
            propertyDefine = type;
        }
        const propertyData: PropertyData = new PropertyData();
        propertyData.name = name;
        propertyData.type = propertyDefine?.type;
        return propertyData;
    }

    public addProperty(propertyDefine: PropertyDefine): PropertyData {
        const currentGraphData = GraphDataMgr.Instance.getCurrentGraphData();

        // name 是唯一标识，如果存在 name 就重命名
        // const existingNames = new Set(currentGraphData.properties.map((item: PropertyData) => item.name));
        let newName = propertyDefine.name;
        // let counter = 1;
        // while (existingNames.has(newName)) {
        //     newName = `${propertyDefine.name}_${counter}`;
        //     counter++;
        // }
        const propertyData: PropertyData | undefined = this.createProperty(propertyDefine, newName ?? "");
        const properties = currentGraphData.details.properties as PropertyData[];
        if (properties) {
            currentGraphData.details.properties.push(propertyData);
            GraphDataMgr.Instance.setDirty(true);
        }
        return propertyData;
    }

    public removeProperty(index: number): PropertyData {
        const currentGraphData = GraphDataMgr.Instance.getCurrentGraphData();

        const property = currentGraphData.details.properties.splice(index, 1)[0];

        // GraphDataMgr.Instance.reduceToBaseNode(property);

        // const rootGraphData = GraphDataMgr.Instance.getRootGraphData();
        // this.removePropertyPinInSubGraphNode(rootGraphData, property.id);
        // for (const graphID in rootGraphData.graphs) {
        //     this.removePropertyPinInSubGraphNode(rootGraphData.graphs[graphID], property.id);
        // }
        // GraphDataMgr.Instance.setDirty(true);
        return property;
    }

    /**
     * 更新 PropertyNode 数据（title、output）
     * @param property
     * @private
     */
    private updatePropertyToGraphNode(property: PropertyData) {
        if (!GraphDataMgr.Instance.graphData) {
            console.debug('updatePropertyToGraphNode failed, the graph data is null');
            return;
        }

        // for (const nodeID in GraphDataMgr.Instance.graphData.nodes) {
        //     const node = GraphDataMgr.Instance.graphData.nodes[nodeID];
        //     const details = node && node.details as INodeDetails;
        //     if (details && details.propertyID === property.id) {
        //         details.title = property.name;
        //     }
        // }

        GraphDataMgr.Instance.reload();
    }
}
