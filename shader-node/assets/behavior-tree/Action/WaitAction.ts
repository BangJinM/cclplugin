import { BTAction } from "../Base/BTAction";
import { bt_class } from "../Base/BTClass";
import { BTStatus } from "../Base/BTStatus";
import { BTType } from "../Base/BTType";

@bt_class(BTType.Action)
export class WaitAction extends BTAction {
    time: number = 0;
    endTime: number = 0;

    constructor(endTime) {
        super()
        this.endTime = endTime
    }

    public Tick(dt: number): BTStatus {
        this.time += dt;
        if (this.time < this.endTime)
            return BTStatus.Running;
        console.log(this.time, this.endTime)
        return BTStatus.Success;
    }
}