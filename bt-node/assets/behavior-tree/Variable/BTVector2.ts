import { Vec2 } from 'cc';
import { bt_variable } from '../Base/BTClass';
import { PropertyType } from "./PropertyType";
import { BTVariable } from "./BTVariable";

@bt_variable()
export default class BTVector2 extends BTVariable<Vec2> {
    bName: string = "BTVector2";
    bType: PropertyType = PropertyType.Vector2;

    GetDefaultValue(): Vec2 {
        return new Vec2()
    }
    SetValue(value: Vec2): void {
        this.value = value
    }
    GetValue(): Vec2 {
        return this.value
    }
}