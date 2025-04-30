import { BTNode } from "./BTNode";
import { BTType } from "./BTType";

export class BTComposite extends BTNode {
    constructor() {
        super()
        this.behaviourNodeType = BTType.Composite
    }

}