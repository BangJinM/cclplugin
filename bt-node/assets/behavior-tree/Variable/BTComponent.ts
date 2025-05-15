import { bt_variable } from "../Base/BTClass";
import { BTVariable } from "./BTVariable";
import { PropertyType } from "./PropertyType";

@bt_variable()
export default class BTComponent extends BTVariable<{ uuid: string }> {
    bName: string = "BTComponent";
    bType: PropertyType= PropertyType.Component;

    GetDefaultValue(): { uuid: string } {
        return { uuid: "" }
    }
    SetValue(value: { uuid: string }): void {
        this.value = value
    }
    GetValue(): { uuid: string } {
        return this.value
    }
}