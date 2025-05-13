import { bt_variable } from "../Base/BTClass";
import { PropertyType } from "../Base/PropertyType";
import { BTVariable } from "./BTVariable";

@bt_variable()
export default class BTComponent extends BTVariable<{ uuid: number }> {
    bName: string = "BTComponent";
    bType: PropertyType= PropertyType.Component;

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