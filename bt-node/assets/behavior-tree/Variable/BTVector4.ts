import { Vec4 } from 'cc';
import { bt_variable } from '../Base/BTClass';
import { PropertyType } from "../Base/PropertyType";
import { BTVariable } from "./BTVariable";

@bt_variable()
export default class BTVector4 extends BTVariable<Vec4> {
    bName: string = "BTVector4";
    bType: PropertyType= PropertyType.Vector4;

    GetDefaultValue(): Vec4 {
        return new Vec4()
    }
    SetValue(value: Vec4): void {
        this.value = value
    }
    GetValue(): Vec4 {
        return this.value
    }
}