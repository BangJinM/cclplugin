import { BTAction } from "../Base/BTAction";
import { bt_class, bt_property } from "../Base/BTClass";
import { BTStatus } from "../Base/BTStatus";
import { BTType } from "../Base/BTType";
import BTFloat from "../Variable/BTFloat";
import { PropertyType } from "../Variable/PropertyType";

@bt_class(BTType.Action)
export class WaitAction extends BTAction {
    time: number = 0;
    @bt_property(PropertyType.Function)
    get endTime(): BTFloat { return null; }

    constructor() {
        super()
    }

    public Tick(dt: number): BTStatus {
        this.time += dt;
        if (this.time < this.endTime?.GetValue()) {
            return BTStatus.Running;
        }

        this.time = 0;
        return BTStatus.Success;
    }
}