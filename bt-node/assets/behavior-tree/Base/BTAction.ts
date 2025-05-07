import { BTNode } from "./BTNode";
import { BTType } from "./BTType";

export class BTAction extends BTNode {
    constructor() {
        super()
        this.behaviourNodeType = BTType.Action
    }
}