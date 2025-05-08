import { BTStatus } from './BTStatus';
import { BTType } from "./BTType";

export class BTNode {
    /** 运行状态 */
    protected btStatus: BTStatus = BTStatus.Failure;
    /** 节点名字 */
    protected nodeName: string = "";
    /** 节点类型 */
    protected behaviourNodeType: BTType = BTType.Action;
    public mChildren: Array<BTNode> = [];

    /** 更新 */
    public Tick(dt: number): BTStatus {
        return BTStatus.Running;
    }

    /**
     * 移除指定的子节点。
     * @param child - 要移除的子节点。
     */
    public RemoveNode(child: BTNode) {
        this.mChildren.map((item, index) => {
            if (item == child) {
                this.mChildren.splice(index, 1)
            }
        })
    }

    /** 添加节点 */
    public AddNode(child: BTNode) {
        this.mChildren.push(child);
    }

    /** 获取节点 */
    public GetNodeByIndex(index: number): BTNode | null {
        if (index < this.mChildren.length)
            return this.mChildren[index];
        return null;
    }

    /** 获取节点数量 */
    public GetChildrenCount(): number {
        if (this.mChildren != null) {
            return this.mChildren.length;
        }
        return 0;
    }

    public GetName() {
        return this.nodeName
    }

    public SetName(name: string) {
        this.nodeName = name
    }
}