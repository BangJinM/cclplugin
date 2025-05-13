import { Vec3 } from 'cc';
import { bt_variable } from '../Base/BTClass';
import { PropertyType } from "../Base/PropertyType";
import { BTVariable } from "./BTVariable";

@bt_variable()
export default class BTVector3 extends BTVariable<Vec3> {
    bName: string = "BTVector3";
    bType: PropertyType= PropertyType.Vector3;

    GetDefaultValue(): Vec3 {
        return new Vec3()
    }
    SetValue(value: Vec3): void {
        this.value = value
    }
    GetValue(): Vec3 {
        return this.value
    }
}