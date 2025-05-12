import { Property } from "./Property"


export interface IBTNodeData {
    id: string
    type: string
    root?: boolean
    properties: { [key: string]: string }
}

export interface IBTEdgeData {
    id: string
    source: string
    target: string
}

export interface IBTNodesData {
    name?: string
    nodes?: { [key: string]: IBTNodeData }
    lines?: { [key: string]: IBTEdgeData }
    properties?: { [key: string]: Property }
}