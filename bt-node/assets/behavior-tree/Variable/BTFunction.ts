import * as cc from "cc";
import { bt_variable } from "../Base/BTClass";
import { BTVariable } from "./BTVariable";
import { PropertyType } from "./PropertyType";

@bt_variable()
export default class BTFunction extends BTVariable<{ uuid: string, component: string, methodName: string }> {
    bName: string = "BTFunction";
    bType: PropertyType = PropertyType.Function;
    /** 运行时获取的组件 */
    comp: cc.Component = null

    GetDefaultValue(): { uuid: string, component: string, methodName: string } {
        return { uuid: "", component: "", methodName: "" }
    }
    SetValue(value: { uuid: string, component: string, methodName: string }): void {
        this.value = value
    }
    GetValue(): { uuid: string, component: string, methodName: string } {
        return this.value
    }

    GetComp(): cc.Component {
        return this.comp
    }

    SetComp(tmepData: cc.Component) {
        this.comp = tmepData
    }
}