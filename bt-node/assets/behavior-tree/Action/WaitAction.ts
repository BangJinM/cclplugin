import { BTAction } from "../Base/BTAction";
import { bt_class, bt_property } from "../Base/BTClass";
import { BTStatus } from "../Base/BTStatus";
import { BTType } from "../Base/BTType";
import { PropertyType } from "../Variable/PropertyType";

@bt_class(BTType.Action)
export class WaitAction extends BTAction {
    time: number = 0;
    @bt_property(PropertyType.Float)
    endTime: number = 0;

    constructor(endTime) {
        super()
        this.endTime = endTime
    }

    public Tick(dt: number): BTStatus {
        this.time += dt;
        if (this.time < this.endTime) {
            return BTStatus.Running;
        }
        
        this.time = 0;
        return BTStatus.Success;
    }
}