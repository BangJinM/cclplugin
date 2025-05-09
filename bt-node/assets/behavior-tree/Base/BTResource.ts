import { Blackboard } from "./BTBlackboard"


export interface IBTNodeData {
    id: string,
    type: string,
    root: boolean,
    position: { x: number, y: number },
    data: { [key: string]: any },
    className: string
}

export interface IBTEdgeData {
    id: string
    source: string
    target: string
}

export interface IBTNodesData {
    nodes: IBTNodeData[]
    edges: IBTEdgeData[]
    blackBoard?: Blackboard
}