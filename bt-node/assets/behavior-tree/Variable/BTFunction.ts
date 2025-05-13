import { bt_variable } from "../Base/BTClass";
import { PropertyType } from "../Base/PropertyType";
import { BTVariable } from "./BTVariable";

@bt_variable()
export default class BTFunction extends BTVariable<{ uuid: number, component: string, methodName: string }> {
    bName: string = "BTFunction";
    bType: PropertyType= PropertyType.Function;

    GetDefaultValue(): { uuid: number, component: string, methodName: string } {
        return { uuid: 0, component: "", methodName: "" }
    }
    SetValue(value: { uuid: number, component: string, methodName: string }): void {
        this.value = value
    }
    GetValue(): { uuid: number, component: string, methodName: string } {
        return this.value
    }
}