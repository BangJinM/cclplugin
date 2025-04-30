import { BTNode } from "./BTNode";
import { BTType } from "./BTType";

export class BTDecorator extends BTNode {
    constructor() {
        super()
        this.behaviourNodeType = BTType.Decorator
    }
}