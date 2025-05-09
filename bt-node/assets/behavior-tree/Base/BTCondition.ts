import { BTNode } from "./BTNode";
import { BTType } from "./BTType";

export class BTCondition extends BTNode {
    constructor() {
        super()
        this.behaviourNodeType = BTType.Condition
    }
}