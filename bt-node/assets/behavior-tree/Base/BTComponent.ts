import * as cc from "cc";
import { btTreeClassMap, btTreePropertyMap } from "./BTClass";
import { BTNode } from "./BTNode";
import { Property } from "./Property";
import { PropertyType } from "./PropertyType";
const { ccclass, property } = cc._decorator;
@ccclass("BTComponent")
export class BTComponent extends cc.Component {
    btName: string = ""
    btNodes: { [key: string]: BTNode } = {}
    btLines: { [key: string]: { source: string, target: string } } = {}
    properties: { [key: string]: Property } = {}
    rootNode: BTNode = null

    @property(cc.JsonAsset)
    jsonAsset: cc.JsonAsset = null

    protected onLoad(): void {
        this.buildTree(this.jsonAsset.json)
    }

    protected start(): void {

    }

    protected update(dt: number): void {
        this.rootNode?.Tick(dt)
    }

    buildTree(obj: Record<string, any>) {
        if (obj.name)
            this.btName = obj.name

        if (obj.properties) {
            for (const key in obj.properties) {
                let data = obj.properties[key]
                if (data.type && PropertyType[data.type]) {
                    this.properties[data.id] = new Property(data.type)
                    this.properties[data.id].setValue(data.value)
                }
            }
        }

        let rootNodeId: string = ""
        if (obj.nodes) {
            for (const key in obj.nodes) {
                let data = obj.nodes[key]
                let classData = btTreeClassMap.get(data.type)
                if (data.type && classData) {
                    let node = Reflect.construct(classData.create, [])
                    this.btNodes[key] = node

                    if (btTreePropertyMap.get(classData.name)) {
                        for (const value of btTreePropertyMap.get(classData.name)!) {
                            if (data.properties[value.name]) {
                                let propertyId = data.properties[value.name]
                                if (propertyId && this.properties[propertyId]) {
                                    node[value.name] = this.properties[propertyId].value
                                }
                            }
                            else {
                                node[value.name] = new Property(value.type)
                            }
                        }
                    }
                }
                if (data.root)
                    rootNodeId = data.id
            }
        }
        this.btLines = obj.lines


        for (const element in this.btLines) {
            let line = this.btLines[element]
            if (line && line.source && line.target && this.btNodes[line.source] && this.btNodes[line.target]) {
                this.btNodes[line.source].AddNode(this.btNodes[line.target])
            }
        }

        this.rootNode = this.btNodes[rootNodeId]
    }
}