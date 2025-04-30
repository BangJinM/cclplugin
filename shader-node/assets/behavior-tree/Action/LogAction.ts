import { BTAction } from "../Base/BTAction";
import { bt_class } from "../Base/BTClass";
import { BTStatus } from "../Base/BTStatus";
import { BTType } from "../Base/BTType";

@bt_class(BTType.Action)
export class LogAction extends BTAction {
    logStr: string = ""

    constructor(logStr) {
        super()
        this.logStr = logStr
    }

    public Tick(dt: number): BTStatus {
        console.log(this.logStr)
        return BTStatus.Success;
    }
}