import { bt_variable } from "../Base/BTClass";
import { PropertyType } from "./PropertyType";
import { BTVariable } from "./BTVariable";

@bt_variable()
export default class BTFunction extends BTVariable<{ uuid: string, component: string, methodName: string }> {
    bName: string = "BTFunction";
    bType: PropertyType= PropertyType.Function;

    GetDefaultValue(): { uuid: string, component: string, methodName: string } {
        return { uuid: "", component: "", methodName: "" }
    }
    SetValue(value: { uuid: string, component: string, methodName: string }): void {
        this.value = value
    }
    GetValue(): { uuid: string, component: string, methodName: string } {
        return this.value
    }
}