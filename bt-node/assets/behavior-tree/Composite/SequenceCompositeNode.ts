import { bt_class } from "../Base/BTClass";
import { BTComposite } from "../Base/BTComposite";
import { BTStatus } from "../Base/BTStatus";
import { BTType } from "../Base/BTType";

@bt_class(BTType.Composite)
export class SequenceCompositeNode extends BTComposite {
    constructor() {
        super()
    }

    public Tick(dt: number): BTStatus {
        for (const child of this.mChildren) {
            let flag = child.Tick(dt)
            if (flag == BTStatus.Failure || flag == BTStatus.Running)
                return flag
        }
        return BTStatus.Success
    }
}