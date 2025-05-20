import { BTAction } from "../Base/BTAction";
import { bt_class, bt_property } from "../Base/BTClass";
import { BTStatus } from "../Base/BTStatus";
import { BTType } from "../Base/BTType";
import BTString from "../Variable/BTString";
import { PropertyType } from "../Variable/PropertyType";

@bt_class(BTType.Action)
export class LogAction extends BTAction {
    @bt_property(PropertyType.String)
    get logStr(): BTString { return new BTString() }

    constructor() {
        super()
    }

    public Tick(dt: number): BTStatus {
        console.log(this.logStr.GetValue())
        return BTStatus.Success;
    }
}