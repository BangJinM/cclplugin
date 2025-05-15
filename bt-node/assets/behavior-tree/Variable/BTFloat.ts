import { bt_variable } from "../Base/BTClass";
import { PropertyType } from "./PropertyType";
import { BTVariable } from "./BTVariable";

@bt_variable()
export default class BTFloat extends BTVariable<number> {
    bName: string = "BTFloat";
    bType: PropertyType= PropertyType.Float;

    GetDefaultValue(): number {
        return 0
    }
    SetValue(value: number): void {
        this.value = value
    }
    GetValue(): number {
        return this.value
    }
}