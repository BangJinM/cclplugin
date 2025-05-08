import { BTAction } from "../Base/BTAction";
import { bt_class, bt_property } from "../Base/BTClass";
import { BTStatus } from "../Base/BTStatus";
import { BTType } from "../Base/BTType";
import { PropertyType } from "../Base/PropertyType";

@bt_class(BTType.Action)
export class LogAction extends BTAction {
    @bt_property(PropertyType.String)
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