import { bt_variable } from "../Base/BTClass";
import { PropertyType } from "../Base/PropertyType";
import { BTVariable } from "./BTVariable";

@bt_variable()
export default class BTNode extends BTVariable<{ uuid: number }> {
    bName: string = "BTNode";
    bType: PropertyType= PropertyType.Node;

    GetDefaultValue(): { uuid: number } {
        return { uuid: 0 }
    }
    SetValue(value: { uuid: number }): void {
        this.value = value
    }
    GetValue(): { uuid: number } {
        return this.value
    }
}