import { bt_variable } from "../Base/BTClass";
import { PropertyType } from "./PropertyType";
import { BTVariable } from "./BTVariable";

@bt_variable()
export default class BTString extends BTVariable<string> {
    bName: string = "BTString";
    bType: PropertyType= PropertyType.String;

    GetDefaultValue(): string {
        return ""
    }
    SetValue(value: string): void {
        this.value = value
    }
    GetValue(): string {
        return this.value
    }
}