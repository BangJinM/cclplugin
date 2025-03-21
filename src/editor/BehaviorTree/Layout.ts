import dagre from "@dagrejs/dagre";
import { Position } from "@vue-flow/core";

export class Layout {
    static doLayout(nodes, edges, direction: string) {
        let dagreGraph = new dagre.graphlib.Graph();;
        dagreGraph.setDefaultEdgeLabel(() => ({}));

        const isHorizontal = direction === "LR";
        dagreGraph.setGraph({ rankdir: direction });

        for (const node of nodes) {
            // if you need width+height of nodes for your layout, you can use the dimensions property of the internal node (`GraphNode` type)
            console.log(node)
            dagreGraph.setNode(node.id, {
                width: 150,
                height: 50,
            });
        }

        for (const edge of edges) {
            dagreGraph.setEdge(edge.source, edge.target);
        }

        dagre.layout(dagreGraph);

        // set nodes with updated positions
        return nodes.map((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);

            return {
                ...node,
                targetPosition: isHorizontal ? Position.Left : Position.Top,
                sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
                position: { x: nodeWithPosition.x, y: nodeWithPosition.y },
            };
        });
    }
}