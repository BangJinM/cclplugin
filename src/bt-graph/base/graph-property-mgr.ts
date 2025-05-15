import type { PropertyDefine } from '../../../@types/bt-node-type';

import { GraphNodeMgr } from './graph-node-mgr';
import { GraphDataMgr, MessageMgr, MessageType, PropertyData } from './index';
import { projectData } from './ProjectData';

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
        return currentGraphData.properties.find((property: PropertyData) => property.id === id);
    }

    public updateProperty(id: string, newPropertyData: PropertyData) {
        const currentGraphData = GraphDataMgr.Instance.getCurrentGraphData();
        currentGraphData.properties = currentGraphData.properties.map((item: PropertyData) => {
            if (item.id === id) {
                return newPropertyData;
            }
            return item;
        });
        GraphDataMgr.Instance.setDirty(true);
        MessageMgr.Instance.send(MessageType.BlackBoardPropertyChange)
    }

    public updatePropertyValue(id: string, value: PropertyData) {
        const currentGraphData = GraphDataMgr.Instance.getCurrentGraphData();
        if (!currentGraphData) return;

        currentGraphData.properties = currentGraphData.properties.map((item: PropertyData) => {
            if (item.id === id) {
                item = value;
            }
            return item;
        });
        GraphDataMgr.Instance.setDirty(true);
        MessageMgr.Instance.send(MessageType.BlackBoardPropertyChange)
    }

    public async iterateProperties(handle: (property: PropertyData, propertyDefine: PropertyDefine | undefined) => void) {
        const currentGraphData = GraphDataMgr.Instance.getCurrentGraphData();
        if (!currentGraphData) return;

        for (const property of currentGraphData.properties ?? []) {
            await handle(property, projectData.getPropertyDefineByType(property.type));
        }
    }

    public exitsProperty(name: string) {
        const currentGraphData = GraphDataMgr.Instance.getCurrentGraphData();

        for (const property of currentGraphData.properties) {
            if (property.name === name) {
                return true;
            }
        }
        return false;
    }

    public createProperty(propertyDefine: PropertyDefine, name: string) {
        const propertyData: PropertyData = new PropertyData();
        propertyData.name = name;
        propertyData.type = propertyDefine?.type;
        return propertyData;
    }

    public addProperty(propertyDefine: PropertyDefine): PropertyData {
        const currentGraphData = GraphDataMgr.Instance.getCurrentGraphData();

        // name 是唯一标识，如果存在 name 就重命名
        const existingNames = new Set(currentGraphData.properties.map((item: PropertyData) => item.name));
        let newName = propertyDefine.name;
        let counter = 1;
        while (existingNames.has(newName)) {
            newName = `${propertyDefine.name}_${counter}`;
            counter++;
        }
        const propertyData: PropertyData = this.createProperty(propertyDefine, newName ?? "");
        const properties = currentGraphData.properties as PropertyData[];
        if (properties) {
            currentGraphData.properties.push(propertyData);
            GraphDataMgr.Instance.setDirty(true);
        }
        return propertyData;
    }

    public removeProperty(index: number): PropertyData {
        const currentGraphData = GraphDataMgr.Instance.getCurrentGraphData();

        const property = currentGraphData.properties.splice(index, 1)[0];
        GraphNodeMgr.Instance.removeBlackBoardProperty(property.id)

        GraphDataMgr.Instance.setDirty(true);

        MessageMgr.Instance.send(MessageType.BlackBoardPropertyChange)
        return property;
    }
}
