import { bt_variable } from "../Base/BTClass";
import { PropertyType } from "../Base/PropertyType";
import { BTVariable } from "./BTVariable";

@bt_variable()
export default class BTBoolean extends BTVariable<boolean> {
    bName: string = "BTBoolean";
    bType: PropertyType= PropertyType.Boolean;

    GetDefaultValue(): boolean {
        return false
    }
    SetValue(value: boolean): void {
        this.value = value
    }
    GetValue(): boolean {
        return this.value
    }
}