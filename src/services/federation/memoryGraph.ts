export type GraphNode = { id: string; type: string; label: string; score: number };
export type GraphEdge = { from: string; to: string; relation: string };

let nodes: GraphNode[] = [];
let edges: GraphEdge[] = [];

export function addNode(type: string, label: string, score: number) {
  const node: GraphNode = { id: Math.random().toString(36).slice(2), type, label, score };
  nodes.push(node);
  return node;
}

export function addEdge(from: string, to: string, relation: string) {
  const edge: GraphEdge = { from, to, relation };
  edges.push(edge);
  return edge;
}

export function getGraph() {
  return { nodes, edges };
}