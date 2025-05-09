import { BTAction } from "../Base/BTAction";
import { bt_class, bt_property } from "../Base/BTClass";
import { BTStatus } from "../Base/BTStatus";
import { BTType } from "../Base/BTType";
import { PropertyType } from "../Base/PropertyType";

@bt_class(BTType.Action)
export class LogAction extends BTAction {
    @bt_property(PropertyType.String)
    logStr: string = ""
    @bt_property(PropertyType.Float)
    test = ""
    @bt_property(PropertyType.Vector2)
    test1 = ""
    @bt_property(PropertyType.Vector3)
    test2 = ""
    @bt_property(PropertyType.Vector4)
    test3 = ""
    @bt_property(PropertyType.Texture2D)
    test4 = ""
    constructor(logStr) {
        super()
        this.logStr = logStr
    }

    public Tick(dt: number): BTStatus {
        console.log(this.logStr)
        return BTStatus.Success;
    }
}