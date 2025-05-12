import { bt_class } from "../Base/BTClass";
import { BTDecorator } from "../Base/BTDecorator";
import { BTStatus } from "../Base/BTStatus";
import { BTType } from "../Base/BTType";

@bt_class(BTType.Decorator)
export class InverseDecorator extends BTDecorator {
    constructor() {
        super()
    }

    public Tick(dt: number): BTStatus {
        if (this.mChildren.length <= 0)
            return BTStatus.Failure;
        for (let index = 0; index < this.mChildren.length; index++) {
            let status = this.mChildren[index].Tick(dt);
            if (status == BTStatus.Failure) return BTStatus.Success
            else if (status == BTStatus.Success) return BTStatus.Failure
            else return BTStatus.Running;
        }
        return BTStatus.Running;
    }
}