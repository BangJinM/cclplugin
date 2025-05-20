import * as cc from "cc";
import BTFloat from "../Variable/BTFloat";
import BTFunction from "../Variable/BTFunction";
import { PropertyType } from "../Variable/PropertyType";
import { BTBlackBoard } from "./BTBlackBoard";
import { btTreeClassMap, btTreePropertyMap, btTreeVariableMap } from "./BTClass";
import { BTNode } from "./BTNode";
const { ccclass, property } = cc._decorator;
@ccclass("BTComponent")
export class BTComponent extends cc.Component {
    btName: string = ""
    btNodes: { [key: string]: BTNode } = {}
    btLines: { [key: string]: { source: string, target: string } } = {}
    blackBoard: BTBlackBoard = new BTBlackBoard()
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
                    let value = Reflect.construct(btTreeVariableMap.get(data.type)!.create, [])
                    value.SetValue(data.value)

                    this.blackBoard.Add(data.id, value)

                    if (data.type == PropertyType.Function) {
                        let scene: cc.Scene = cc.director.getScene()
                        let comps = scene.getComponentsInChildren(data.value?.component)
                        if (comps.length > 0) {
                            let resultComp = null
                            let uuid = data.value.uuid
                            for (const comp of comps) {
                                if (comp.node.uuid == uuid) {
                                    resultComp = comp
                                }
                            }

                            if (resultComp) {
                                (value as BTFunction).SetComp(resultComp)
                            }
                        }
                    }
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
                            this.BindProperty(data.properties[value.name], value.type as PropertyType, node, value.name)
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

    GetNum() {
        let float = new BTFloat()
        float.SetValue(10)
        return float;
    }

    BindProperty(propertyId: string, propertyType: PropertyType, btNode: BTNode, propertyKey: string) {
        if (!this.blackBoard.Get(propertyId)) {
            console.error(`${btNode.constructor.name} 类中的${propertyId}字段暂未绑定属性`)
            return
        }

        let descriptor = Object.getOwnPropertyDescriptor(btNode.constructor.prototype, propertyKey);
        if (descriptor) {
            const oldSet = descriptor.set;
            Object.defineProperty(btNode, propertyKey, {
                get: () => {
                    switch (propertyType) {
                        case PropertyType.Node: {
                            let data = this.blackBoard.Get(propertyId)
                            let scene: cc.Scene = cc.director.getScene()
                            return scene.getChildByUuid(data.GetValue()?.uuid)
                        } case PropertyType.Function: {
                            let data = this.blackBoard.Get(propertyId) as BTFunction
                            if (!data || !data.GetComp()) return
                            return data.GetComp()[data.GetValue().methodName]?.call()
                        }
                        default: {
                            return this.blackBoard.Get(propertyId)
                        }
                    }
                },
                set: oldSet,
                enumerable: true,
                configurable: true
            });
        }


    }
}